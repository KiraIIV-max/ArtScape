import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineCalendarMonth } from "react-icons/md";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Bid() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [filterArtist, setFilterArtist] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidErr, setBidErr] = useState(null);

  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeErr, setPlaceErr] = useState(null);
  const [placeOk, setPlaceOk] = useState(null);

  const token = localStorage.getItem("auth_token"); // Assume stored after login
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const [detectedUser, setDetectedUser] = useState(currentUser || null);
  const currentUserId = detectedUser?.user_id ?? detectedUser?.id ?? null;
  const [handledWinners, setHandledWinners] = useState(() => new Set());
  const [pendingWins, setPendingWins] = useState([]);

  // Try to detect current user from API (sanctum cookie or bearer token) if not present in localStorage
  useEffect(() => {
    let mounted = true;
    const tryFetchMe = async () => {
      if (detectedUser) return;
      try {
        if (token) {
          const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return;
          const j = await res.json();
          if (mounted) setDetectedUser(j);
          return;
        }
        // try cookie-based (sanctum) auth
        const res2 = await fetch(`${API_BASE}/me`, { credentials: 'include' });
        if (!res2.ok) return;
        const j2 = await res2.json();
        if (mounted) setDetectedUser(j2);
      } catch (e) {
        // ignore
      }
    };
    tryFetchMe();
    return () => { mounted = false };
  }, [detectedUser, token]);

  // Fetch auctions (with artwork)
  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/auctions`);
        if (!res.ok) throw new Error("Failed to load auctions");
        const data = await res.json();
        setAuctions(data || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // Filtered auctions client-side by artist name and tag text (if available)
  const filteredAuctions = useMemo(() => {
    return auctions.filter((a) => {
      const artistName =
        a?.artwork?.artist?.name || a?.artwork?.artist_name || "";
      const tags =
        a?.artwork?.tags?.map((t) => t.name?.toLowerCase?.()) || [];
      const tagMatch =
        !filterTag ||
        tags.some((t) => t.includes(filterTag.trim().toLowerCase()));
      const artistMatch =
        !filterArtist ||
        artistName.toLowerCase().includes(filterArtist.trim().toLowerCase());
      return tagMatch && artistMatch;
    });
  }, [auctions, filterArtist, filterTag]);

  const handleSelectAuction = async (auction) => {
    setSelectedAuction(auction);
    setBids([]);
    setBidErr(null);
    setPlaceOk(null);
    setBidAmount("");
    if (!auction?.id) return;
    setBidsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auctions/${auction.id}/bids`);
      if (!res.ok) throw new Error("Failed to load bids");
      const data = await res.json();
      setBids(data || []);
    } catch (e) {
      setBidErr(e.message);
    } finally {
      setBidsLoading(false);
    }
  };

  const computeMinBid = (auction) => {
    if (!auction) return null;
    const highest =
      auction.current_highest_bid ??
      auction.artwork?.starting_price ??
      auction.starting_bid ??
      0;
    return Number(highest) + 10;
  };

  const handlePlaceBid = async () => {
    if (!token) {
      setPlaceErr("You need to log in as a buyer to place a bid.");
      return;
    }
    if (!selectedAuction?.id) {
      setPlaceErr("Select an auction first.");
      return;
    }
    const minBid = computeMinBid(selectedAuction);
    const amountNum = Number(bidAmount);
    if (Number.isNaN(amountNum)) {
      setPlaceErr("Enter a valid number.");
      return;
    }
    if (minBid != null && amountNum < minBid) {
      setPlaceErr(`Bid must be at least $${minBid.toFixed(2)}.`);
      return;
    }

    setPlacing(true);
    setPlaceErr(null);
    setPlaceOk(null);
    try {
      const res = await fetch(`${API_BASE}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auction_id: selectedAuction.id,
          amount: amountNum,
        }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || "Failed to place bid");
      }
      setPlaceOk("Bid placed successfully!");
      // refresh bids & auction info
      await handleSelectAuction(selectedAuction);
    } catch (e) {
      setPlaceErr(e.message);
    } finally {
      setPlacing(false);
    }
  };

  // Poll for auction winner when an auction is selected.
  useEffect(() => {
    if (!selectedAuction) return;

    let mounted = true;
    const checkWinner = async () => {
      try {
        const res = await fetch(`${API_BASE}/auctions/${selectedAuction.id}/winner`);
        if (!res.ok) return;
        const data = await res.json();
        console.log('checkWinner response for auction', selectedAuction.id, data);
        if (!mounted) return;
        // AuctionController returns a bid object when ended, or a message if not ended.
        if (data && !data.message && data.user_id) {
          console.log('Winner detected:', data.user_id, 'currentUserId:', currentUserId);
          // If current user is the winner, redirect to artworkwon page
          if (currentUserId && Number(data.user_id) === Number(currentUserId)) {
            console.log('Navigating to artworkwon for auction', selectedAuction.id);
            // navigate with state and auctionId query so page still works after refresh
            navigate(`/artworkwon?auctionId=${selectedAuction.id}`, { state: { auction: selectedAuction, winner: data } });
          }
        } else {
          if (data && data.message) console.log('Winner endpoint message:', data.message);
        }
      } catch (e) {
        // ignore polling errors
        console.error('checkWinner error', e);
      }
    };

    // Immediately check, then poll
    checkWinner();
    const iv = setInterval(checkWinner, 8000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [selectedAuction, currentUserId, navigate]);

  // Background poll: check all auctions for any ended/closed auctions
  // where the current user is the winner. This makes redirect reliable
  // even when the user doesn't have the auction details open.
  useEffect(() => {
    if (!currentUserId) return;

    let mounted = true;

    const checkAllAuctions = async () => {
      try {
        const res = await fetch(`${API_BASE}/auctions`);
        if (!res.ok) return;
        const data = await res.json();

        if (!mounted) return;

        for (const auc of data) {
          // consider ended/closed/ended statuses as finished auctions
          if (['ended', 'closed'].includes(auc.status)) {
            // find highest bid (bids are ordered desc from backend?)
            const highest = (auc.bids || []).reduce((max, b) => {
              return !max || Number(b.amount) > Number(max.amount) ? b : max;
            }, null);
            if (highest && Number(highest.user_id) === Number(currentUserId)) {
              if (!handledWinners.has(auc.id)) {
                // mark handled
                setHandledWinners((prev) => {
                  const next = new Set(prev);
                  next.add(auc.id);
                  return next;
                });

                // If the user is currently viewing this auction, navigate immediately.
                if (selectedAuction && selectedAuction.id === auc.id) {
                  navigate(`/artworkwon?auctionId=${auc.id}`, { state: { auction: auc, winner: highest } });
                  return; // stop after navigation
                }

                // Otherwise add to pending wins and show a non-intrusive banner instead of redirecting
                setPendingWins((prev) => {
                  if (prev.some((p) => p.auction.id === auc.id)) return prev;
                  return [...prev, { auction: auc, winner: highest }];
                });
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    };

    // initial check + poll
    checkAllAuctions();
    const iv = setInterval(checkAllAuctions, 8000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [currentUserId, handledWinners, navigate]);

  const auctionActive = selectedAuction
    ? new Date(selectedAuction.start_date) < new Date() &&
      new Date(selectedAuction.end_date) > new Date() &&
      selectedAuction.artwork?.status !== 'sold'
    : false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse & Bid</h1>
          <p className="text-sm text-gray-600">
            View artworks, see bid history without logging in, and place bids
            when signed in as a buyer.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/register"
            className="px-3 py-2 text-sm rounded bg-gray-900 text-white"
          >
            Login
          </a>
        </div>
      </header>

      {pendingWins.length > 0 && (
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">You have {pendingWins.length} new win{pendingWins.length>1? 's' : ''}</div>
                <div className="text-xs opacity-90">Congratulations — your winning auctions are listed below.</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPendingWins([])} className="text-white/90 text-sm px-3 py-1 rounded border border-white/20">Dismiss All</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-3">
            <div className="grid gap-3">
              {pendingWins.map((p) => (
                <div key={p.auction.id} className="flex items-center gap-3">
                  <img src={p.auction.artwork?.image_url} alt={p.auction.artwork?.title} className="w-16 h-12 object-cover rounded-md bg-gray-100"/>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.auction.artwork?.title ?? `Auction #${p.auction.id}`}</div>
                    <div className="text-xs text-gray-500">Winning bid: ${Number(p.winner.amount ?? p.winner.bid_amount ?? 0).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // navigate to the artworkwon page for that auction (do not remove other wins)
                        navigate(`/artworkwon?auctionId=${p.auction.id}`, { state: { auction: p.auction, winner: p.winner } });
                      }}
                      className="px-3 py-1 bg-black text-white rounded text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setPendingWins((prev) => prev.filter((x) => x.auction.id !== p.auction.id))}
                      className="text-sm text-gray-500 hover:text-gray-700"
                      title="Dismiss this win"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Filter by artist</label>
          <input
            className="border rounded px-3 py-2"
            value={filterArtist}
            onChange={(e) => setFilterArtist(e.target.value)}
            placeholder="e.g., Picasso"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Filter by tag</label>
          <input
            className="border rounded px-3 py-2"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            placeholder="e.g., modern"
          />
        </div>
      </section>

      {loading && <div className="text-gray-600">Loading auctions...</div>}
      {err && (
        <div className="text-red-600 text-sm">
          {err} — showing nothing. Try refreshing.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAuctions.map((auction) => {
          const artwork = auction.artwork || {};
          const artistName =
            artwork.artist?.name || artwork.artist_name || "Unknown artist";
          const tags =
            artwork.tags?.map((t) => t.name).filter(Boolean) ?? ["—"];
          const category =
            artwork.category?.name ||
            artwork.category_name ||
            (artwork.category_id ? `Category #${artwork.category_id}` : "—");
          const minBid = computeMinBid(auction);

          return (
            <div
              key={auction.id}
              className="border rounded-lg shadow-sm overflow-hidden flex flex-col"
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-48 object-cover bg-gray-100"
              />
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase text-gray-500">
                      {artistName}
                    </p>
                    <h2 className="font-semibold text-lg">
                      {artwork.title || "Untitled"}
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">
                    {category}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {artwork.description || "No description"}
                </p>

                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <MdOutlineCalendarMonth />{" "}
                    <span>
                      Start:{" "}
                      {auction.start_date
                        ? new Date(auction.start_date).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineCalendarMonth />{" "}
                    <span>
                      End:{" "}
                      {auction.end_date
                        ? new Date(auction.end_date).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 text-xs">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-2 space-y-1 text-sm">
                  <div>
                    Initial Price:{" "}
                    <span className="font-semibold">
                      ${Number(artwork.starting_price ?? auction.starting_bid ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    Current Highest:{" "}
                    <span className="font-semibold">
                      ${Number(auction.current_highest_bid ?? artwork.starting_price ?? auction.starting_bid ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Next minimum bid:{" "}
                    {minBid != null ? `$${minBid.toFixed(2)}` : "—"}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectAuction(auction)}
                  className="mt-2 w-full px-3 py-2 rounded bg-black text-white text-sm"
                >
                  View bids & bid
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {selectedAuction && (
        <section className="border rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Selected auction</p>
              <h3 className="text-lg font-semibold">
                {selectedAuction.artwork?.title || "Untitled"}
              </h3>
            </div>
            <button
              onClick={() => setSelectedAuction(null)}
              className="text-sm text-gray-500 hover:text-black"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-semibold text-sm">Bid history</h4>
              {bidsLoading && <p className="text-gray-600 text-sm">Loading bids...</p>}
              {bidErr && <p className="text-red-600 text-sm">{bidErr}</p>}
              {!bidsLoading && !bidErr && bids.length === 0 && (
                <p className="text-sm text-gray-500">No bids yet.</p>
              )}
              {!bidsLoading && bids.length > 0 && (
                <div className="space-y-2">
                  {bids.map((b) => (
                    <div
                      key={b.id}
                      className="border rounded p-2 flex justify-between text-sm"
                    >
                      <div>
                        <div className="font-semibold">${Number(b.amount).toFixed(2)}</div>
                        <div className="text-gray-600">
                          {b.user?.name || `User #${b.user_id}`}
                        </div>
                      </div>
                      <div className="text-right text-gray-600">
                        {b.bid_time
                          ? new Date(b.bid_time).toLocaleString()
                          : b.created_at
                          ? new Date(b.created_at).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Place a bid</h4>
              {!token && (
                <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded">
                  Please log in as a buyer to place bids.
                </p>
              )}
              <label className="text-xs text-gray-600">Amount (USD)</label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full border rounded px-3 py-2"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!token || placing || !auctionActive}
              />
              {!auctionActive && (
                <p className="text-sm text-gray-600">
                  {selectedAuction?.artwork?.status === 'sold'
                    ? 'This artwork has been sold and is no longer available.'
                    : 'Auction is not active.'}
                </p>
              )}
              {placeErr && <p className="text-sm text-red-600">{placeErr}</p>}
              {placeOk && <p className="text-sm text-green-700">{placeOk}</p>}
              <button
                onClick={handlePlaceBid}
                disabled={!token || placing || !auctionActive}
                className="w-full px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-50"
              >
                {placing ? "Placing..." : "Place bid"}
              </button>
              <p className="text-xs text-gray-500">
                Rule: each new bid must be at least \$10 higher than the current highest (or
                the initial price if no bids).
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}