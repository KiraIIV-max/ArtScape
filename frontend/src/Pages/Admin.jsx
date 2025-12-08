import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer.jsx";
import Photoroom from "../../src/assets/1-2Photoroom.png";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Admin = () => {
  const [pendingArtists, setPendingArtists] = useState([]);
  const [pendingArtworks, setPendingArtworks] = useState([]);
  const [wallArtworks, setWallArtworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userFilters, setUserFilters] = useState({ page: 1, per_page: 10 });

  // Use the same key as the rest of the app
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

  const fetchPending = async () => {
    if (!token) {
      setMessage("Please log in as an admin to manage approvals.");
      setLoading(false);
      return;
    }

    try {
      const [artistRes, artworkRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/artists/pending`, { headers }),
        fetch(`${API_BASE_URL}/admin/artworks/pending`, { headers }),
      ]);

      if (!artistRes.ok || !artworkRes.ok) {
        throw new Error("Failed to load pending data.");
      }

      const artistData = await artistRes.json();
      const artworkData = await artworkRes.json();

      setPendingArtists(artistData.artists || []);
      setPendingArtworks(artworkData.artworks || []);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to reach the server.");
    }
  };

  const fetchWallArtworks = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/artworks?status=approved&per_page=12`,
        { headers }
      );
      if (!res.ok) throw new Error("Unable to load wall posts.");
      const data = await res.json();
      setWallArtworks(data.data || data || []);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to load wall posts.");
    }
  };

  const fetchUsers = async () => {
    if (!token) {
      setMessage("Please log in as an admin to view users.");
      return;
    }
    try {
      const query = new URLSearchParams(userFilters).toString();
      const res = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
        headers,
      });
      if (!res.ok) throw new Error("Unable to load users.");
      const data = await res.json();
      setUsers(data.data || []);
      setUsersMeta({
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
      });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to list users.");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchWallArtworks(), fetchUsers()]);
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userFilters]);

  const handleArtistDecision = async (artistId, action) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/artists/${artistId}/${action}`,
        { method: "POST", headers }
      );
      if (!res.ok) throw new Error(`Failed to ${action} artist.`);
      setPendingArtists((prev) =>
        prev.filter((artist) => artist.user_id !== artistId)
      );
      setMessage(`Artist ${action}ed successfully.`);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to update artist status.");
    }
  };

  const handleArtworkDecision = async (artworkId, action) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/artworks/${artworkId}/${action}`,
        { method: "POST", headers }
      );
      if (!res.ok) throw new Error(`Failed to ${action} artwork.`);
      setPendingArtworks((prev) =>
        prev.filter(
          (art) => art.artwork_id !== artworkId && art.id !== artworkId
        )
      );
      setMessage(`Artwork ${action}ed successfully.`);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to update artwork status.");
    }
  };

  const handleRemoveWallPost = async (artworkId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/artworks/${artworkId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to remove post.");
      setWallArtworks((prev) =>
        prev.filter((art) => art.artwork_id !== artworkId && art.id !== artworkId)
      );
      setMessage("Wall post removed successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Unable to remove wall post.");
    }
  };

  const handleUserPageChange = (direction) => {
    setUserFilters((prev) => {
      const nextPage =
        direction === "next"
          ? Math.min(prev.page + 1, usersMeta?.last_page || prev.page)
          : Math.max(prev.page - 1, 1);
      return { ...prev, page: nextPage };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={Photoroom} alt="ArtScape logo" className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-bold">Admin Control</h1>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Review artists · Approve artwork · Protect the wall
                </p>
              </div>
            </div>
            {message && (
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                {message}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Pending artists</p>
                <p className="text-3xl font-bold">{pendingArtists.length}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Pending artworks</p>
                <p className="text-3xl font-bold">{pendingArtworks.length}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Wall posts</p>
                <p className="text-3xl font-bold">{wallArtworks.length}</p>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Pending Artists</h2>
              {pendingArtists.length === 0 ? (
                <p className="text-gray-500">No artists awaiting approval.</p>
              ) : (
                pendingArtists.map((artist) => (
                  <article
                    key={artist.user_id}
                    className="border rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{artist.name}</p>
                      <span className="text-sm text-gray-400">
                        {new Date(artist.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{artist.email}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleArtistDecision(artist.user_id, "approve")
                        }
                        className="flex-1 rounded-full bg-green-600 text-white py-2 text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleArtistDecision(artist.user_id, "reject")
                        }
                        className="flex-1 rounded-full bg-red-600 text-white py-2 text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Pending Artworks</h2>
              {pendingArtworks.length === 0 ? (
                <p className="text-gray-500">No artworks awaiting review.</p>
              ) : (
                pendingArtworks.map((artwork) => (
                  <article
                    key={artwork.artwork_id || artwork.id}
                    className="border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{artwork.title}</p>
                      <span className="text-sm text-gray-400">
                        {artwork.artist?.name || "Artist"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{artwork.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleArtworkDecision(
                            artwork.artwork_id || artwork.id,
                            "approve"
                          )
                        }
                        className="flex-1 rounded-full bg-green-600 text-white py-2 text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleArtworkDecision(
                            artwork.artwork_id || artwork.id,
                            "reject"
                          )
                        }
                        className="flex-1 rounded-full bg-red-600 text-white py-2 text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>

          <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Approved Wall Posts</h2>
            {wallArtworks.length === 0 ? (
              <p className="text-gray-500">No approved posts visible on the wall.</p>
            ) : (
              wallArtworks.map((art) => (
                <article
                  key={art.artwork_id || art.id}
                  className="border rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{art.title}</p>
                    <button
                      onClick={() =>
                        handleRemoveWallPost(art.artwork_id || art.id)
                      }
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove from wall
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{art.description}</p>
                  <div className="text-sm text-gray-500">
                    Uploaded by {art.artist?.name || "Artist"} · $
                    {art.starting_price}
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Registered Users</h2>
            <div className="grid gap-4">
              {users.length === 0 ? (
                <p className="text-gray-500">No users to display.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.user_id || user.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border rounded-xl p-4"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Role: {user.role} · Status: {user.status}
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <button
                onClick={() => handleUserPageChange("prev")}
                disabled={usersMeta.current_page <= 1}
                className="px-3 py-1 rounded-full border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {usersMeta.current_page || 1} of {usersMeta.last_page || 1}
              </span>
              <button
                onClick={() => handleUserPageChange("next")}
                disabled={
                  usersMeta.current_page >= (usersMeta.last_page || 1)
                }
                className="px-3 py-1 rounded-full border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Admin;