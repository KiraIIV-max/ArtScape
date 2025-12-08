import { useEffect, useState, useMemo } from "react";
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
                disabled={!token || placing}
              />
              {placeErr && <p className="text-sm text-red-600">{placeErr}</p>}
              {placeOk && <p className="text-sm text-green-700">{placeOk}</p>}
              <button
                onClick={handlePlaceBid}
                disabled={!token || placing}
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