import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import Footer from "../components/Footer.jsx";

const ARTWORK_STATUS_LABELS = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
};
const API_BASE_URL = "http://127.0.0.1:8000/api";

const Artist = () => {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [artistStatus, setArtistStatus] = useState(null);
  const [auctionInfo, setAuctionInfo] = useState({});

  // Use the same key as Register/Bid: auth_token
  const token =
    localStorage.getItem("auth_token") || localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [token]
  );

  const canUpload = artistStatus === "approved";

  const refreshArtworks = async () => {
    if (!token) {
      setMessage("Please log in to manage your artworks.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/artist/artworks`, { headers });
      if (!res.ok) throw new Error("Unable to load artworks.");
      const data = await res.json();
      const artworksArray = Array.isArray(data) ? data : data.artworks || [];
      setArtworks(artworksArray);
      setMessage("");

      // Try to pick up status from payload if present
      const statusFromData =
        data.artist?.verification_status ||
        data.artist?.status ||
        artworksArray[0]?.artist?.verification_status ||
        artworksArray[0]?.artist?.status;
      if (statusFromData) setArtistStatus(statusFromData);
    } catch (err) {
      console.error("Failed to load artworks:", err);
      setMessage("Unable to load your artworks right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get status from stored user (if any)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setArtistStatus(parsed.status || parsed.verification_status || null);
      } catch {
        setArtistStatus(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshArtworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  const handleEditArtwork = (artwork) => {
    navigate("/upload", {
      state: { artwork, isEditing: true },
    });
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this artwork permanently?"
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/artist/artworks/${artworkId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Delete failed.");
      setArtworks((prev) =>
        prev.filter((art) => art.artwork_id !== artworkId && art.id !== artworkId)
      );
      setMessage("Artwork deleted.");
    } catch (err) {
      console.error("Delete artwork error:", err);
      setMessage(err.message || "Unable to delete artwork.");
    }
  };

  const handleExtendAuction = async (auction) => {
    const hoursInput = window.prompt(
      "Hours to extend (1-72)",
      String(auctionInfo[auction.id]?.suggestedHours || 1)
    );
    if (!hoursInput) return;
    const hours = Number(hoursInput);
    if (!hours || hours < 1 || hours > 72) {
      setMessage("Enter a valid hour count (1-72).");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/artist/auctions/${auction.id}/extend`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ hours }),
        }
      );
      if (!res.ok) throw new Error("Unable to extend.");
      const data = await res.json();
      setMessage("Auction extended.");
      setArtworks((prev) =>
        prev.map((art) => {
          if (
            art.auction &&
            (Array.isArray(art.auction)
              ? art.auction.some((a) => a.id === auction.id)
              : art.auction.id === auction.id)
          ) {
            return {
              ...art,
              auction: Array.isArray(art.auction)
                ? art.auction.map((a) => (a.id === auction.id ? data.auction : a))
                : data.auction,
            };
          }
          return art;
        })
      );
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Extension failed.");
    }
  };

  const handleFetchWinner = async (auctionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/winner`, {
        headers,
      });
      if (!res.ok) throw new Error("Unable to fetch winner yet.");
      const data = await res.json();
      setMessage(
        `Winner: ${data.winner?.name} (${data.winner?.email}) · \$${data.winner?.bid_amount}`
      );
    } catch (err) {
      console.error(err);
      setMessage(err.message || "No winner yet.");
    }
  };

  const getAuctions = (art) => {
    if (!art.auction) return [];
    if (Array.isArray(art.auction)) return art.auction;
    return [art.auction];
  };

  const isAuctionActive = (auction) =>
    new Date() >= new Date(auction.start_date) &&
    new Date() < new Date(auction.end_date);

  const isAuctionEnded = (auction) => new Date() >= new Date(auction.end_date);

  return (
    <>
      <section className="min-h-screen bg-white text-gray-900 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={Photoroom} alt="logo" className="w-16 h-16" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Artist Hub</h1>
                <p className="text-sm uppercase tracking-wide text-gray-500">
                  Manage artworks · Extend auctions · See winners
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/upload")}
                className="px-6 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition"
              >
                Upload Artwork
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  refreshArtworks();
                }}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
              >
                Refresh list
              </button>
            </div>
            {artistStatus && artistStatus !== "approved" && (
              <div className="rounded-xl bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
                Your account is currently <strong>{artistStatus}</strong>. Artworks
                and uploads remain invisible until approval completes.
              </div>
            )}
          </header>

          {message && (
            <p className="rounded-xl bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3">
              {message}
            </p>
          )}

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Artworks</h2>
            {loading ? (
              <p>Loading your artworks…</p>
            ) : artworks.length === 0 ? (
              <p className="text-gray-500">You haven’t uploaded any artworks yet.</p>
            ) : (
              <div className="space-y-4">
                {artworks.map((art) => (
                  <article
                    key={art.artwork_id || art.id}
                    className="border rounded-2xl p-5 flex flex-col gap-4 bg-gray-50"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500">
                          {ARTWORK_STATUS_LABELS[art.status] || art.status}
                        </p>
                        <h3 className="text-xl font-bold">{art.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditArtwork(art)}
                          className="rounded-full border border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteArtwork(art.artwork_id || art.id)
                          }
                          className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-gray-600 text-sm">{art.description}</p>
                        <div className="text-sm text-gray-500">
                          <span>Starting price: </span>
                          <span className="font-semibold">
                            ${art.starting_price}
                          </span>
                        </div>
                      </div>
                      <div className="w-full md:w-40 h-40 bg-gray-200 rounded-2xl overflow-hidden">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {getAuctions(art).length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Auctions</h4>
                        {getAuctions(art).map((auction) => {
                          const isActive = isAuctionActive(auction);
                          const isEnded = isAuctionEnded(auction);
                          return (
                            <div
                              key={auction.id}
                              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                            >
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                  {new Date(auction.start_date).toLocaleString()} →
                                  {` ${new Date(auction.end_date).toLocaleString()}`}
                                </p>
                                <span className="text-xs uppercase tracking-wider text-gray-400">
                                  {isActive
                                    ? "Live"
                                    : isEnded
                                    ? "Ended"
                                    : "Upcoming"}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {isActive && (
                                  <button
                                    onClick={() => handleExtendAuction(auction)}
                                    className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                                  >
                                    Extend auction
                                  </button>
                                )}
                                {isEnded && (
                                  <button
                                    onClick={() => handleFetchWinner(auction.id)}
                                    className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                                  >
                                    View winner
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Bids accepted between{" "}
                                {new Date(auction.start_date).toLocaleTimeString()}{" "}
                                (inclusive) and{" "}
                                {new Date(auction.end_date).toLocaleTimeString()}{" "}
                                (exclusive).
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Artist;