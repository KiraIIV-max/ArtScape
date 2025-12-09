import { useCallback, useEffect, useMemo, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedToken =
    localStorage.getItem("auth_token") || localStorage.getItem("token");

  const { artwork, isEditing } = location.state || {};
  const [form, setForm] = useState({
    title: "",
    description: "",
    starting_price: "",
    image_url: "",
    category_id: "",
    auction_start: "",
    auction_end: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [extendHours, setExtendHours] = useState(1);

  // Normalize auction from artwork (can be object or array)
  const auction = useMemo(() => {
    if (!artwork) return null;
    if (artwork.auction && Array.isArray(artwork.auction))
      return artwork.auction[0];
    if (artwork.auction && !Array.isArray(artwork.auction))
      return artwork.auction;
    if (artwork.auctions && Array.isArray(artwork.auctions))
      return artwork.auctions[0];
    return null;
  }, [artwork]);

  const canExtend =
    auction && auction.end_date && new Date() < new Date(auction.end_date);

  useEffect(() => {
    if (artwork) {
      setForm({
        title: artwork.title || "",
        description: artwork.description || "",
        starting_price: artwork.starting_price || "",
        image_url: artwork.image_url || "",
        category_id: artwork.category_id || "",
        auction_start: artwork.auction_start
          ? artwork.auction_start.slice(0, 16)
          : "",
        auction_end: artwork.auction_end
          ? artwork.auction_end.slice(0, 16)
          : auction?.end_date
          ? auction.end_date.slice(0, 16)
          : "",
      });
      setPreview(artwork.image_url || "");
    } else if (!isEditing) {
      // Set default auction start time to current date/time for new artworks
      const now = new Date();
      const defaultStart = now.toISOString().slice(0, 16);
      
      // End date field remains empty by default
      setForm(prev => ({
        ...prev,
        auction_start: defaultStart,
        auction_end: "" // Empty by default
      }));
    }
  }, [artwork, auction, isEditing]);

  // Headers for FormData (do NOT set Content-Type)
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${storedToken}`,
      Accept: "application/json",
    }),
    [storedToken]
  );

  // Headers for JSON requests (e.g., extend)
  const jsonHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${storedToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [storedToken]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!storedToken) {
    setStatusMessage("You must be logged in.");
    return;
  }
  if (!form.category_id) {
    setStatusMessage("Please select a category.");
    return;
  }
  if (!isEditing && !form.auction_end) {
    setStatusMessage("Please set an auction end time.");
    return;
  }
  if (!isEditing && new Date(form.auction_end) <= new Date(form.auction_start)) {
    setStatusMessage("End time must be after start time.");
    return;
  }

  setSubmitting(true);
  setStatusMessage("");

  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("starting_price", form.starting_price);
    formData.append("category_id", form.category_id);

    // Only send auction times when creating new artwork
    if (!isEditing) {
      formData.append("auction_start", form.auction_start);
      formData.append("auction_end", form.auction_end);
    } else if (form.auction_end) {
      // When editing, only send new end time if changed
      formData.append("auction_end", form.auction_end);
    }

    if (file) {
      formData.append("image", file);
    } else if (form.image_url) {
      formData.append("image_url", form.image_url);
    }

    if (isEditing) {
      formData.append("_method", "PUT");
    }

    const endpoint = isEditing
      ? `${API_BASE_URL}/artist/artworks/${artwork.id}`
      : `${API_BASE_URL}/artist/artworks`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storedToken}`,
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save artwork");
    }

    setStatusMessage(isEditing ? "Artwork updated!" : "Artwork uploaded!");
    setTimeout(() => navigate("/artist"), 1500);
  } catch (error) {
    setStatusMessage(error.message || "Something went wrong");
  } finally {
    setSubmitting(false);
  }
};

  const handleExtendAuction = useCallback(async () => {
    if (!storedToken) {
      setStatusMessage("You must be logged in to extend an auction.");
      return;
    }
    if (!auction) {
      setStatusMessage("No auction found for this artwork.");
      return;
    }
    if (extendHours < 1 || extendHours > 72) {
      setStatusMessage("Hours must be between 1 and 72.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/artist/auctions/${auction.id}/extend`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ hours: Number(extendHours) }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to extend auction.");
      setStatusMessage("Auction extended.");
      if (data.auction?.end_date) {
        setForm((prev) => ({
          ...prev,
          auction_end: data.auction.end_date.slice(0, 16),
        }));
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Extension failed.");
    }
  }, [auction, extendHours, jsonHeaders, storedToken]);

  return (
    <>
      <section className="mx-20">
        <h1 className="text-4xl text-center pb-14">
          {isEditing ? "Edit Artwork" : "Upload Your Art"}
        </h1>
        {statusMessage && (
          <p className="text-center text-sm text-blue-600 mb-6">
            {statusMessage}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-18">
          <div className="w-[650px] flex flex-col items-center gap-8">
            <label
              htmlFor="file"
              className="w-full border-2 border-dashed border-gray-400 h-70 flex flex-col gap-2 items-center justify-center bg-gray-200 rounded-xl cursor-pointer hover:bg-gray-300 transition"
            >
              <FiUpload className="w-8 h-8 text-gray-600" />
              <span className="text-gray-700 font-medium">Upload your art</span>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 w-48 h-32 object-cover rounded-lg"
                />
              )}
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-xl w-fit transition duration-300 ease-in-out group hover:-translate-y-1.5 hover:scale-105 z-20 px-6 py-2 text-white relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed bg-blue-600 rounded-xl"
            >
              {isEditing ? "Save Changes" : "Upload Art"}
            </button>
          </div>
          <div className="flex flex-col gap-10">
            <label className="text-black font-semibold">
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Artwork title"
                required
                type="text"
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
              />
            </label>
            <label className="text-black font-semibold">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your art"
                required
                className="block rounded-xl w-xl ml-3 px-10 py-6 bg-gray-200"
              />
            </label>
            <label className="text-black font-semibold">
              Starting price
              <input
                name="starting_price"
                value={form.starting_price}
                onChange={handleChange}
                placeholder="Starting price"
                required
                type="number"
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
              />
            </label>
            
            {/* Auction Start Time - Read-only when editing */}
            <label className="text-black font-semibold">
              Auction Start Time
              <input
                name="auction_start"
                value={form.auction_start}
                onChange={handleChange}
                required
                type="datetime-local"
                readOnly={isEditing} // Read-only when editing
                className={`block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200 ${isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
              />
            </label>
            
            {/* Auction End Time - Always editable */}
            <label className="text-black font-semibold">
              Auction End Time
              <input
                name="auction_end"
                value={form.auction_end}
                onChange={handleChange}
                required
                type="datetime-local"
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
              />
            </label>

            {isEditing && auction && (
              <div className="mt-2 rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Current auction window:{" "}
                  <strong>
                    {new Date(auction.start_date).toLocaleString()}
                  </strong>{" "}
                  →{" "}
                  <strong>{new Date(auction.end_date).toLocaleString()}</strong>
                </p>
                {canExtend ? (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-800">
                      Extend by (hours 1-72):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={extendHours}
                      onChange={(e) => setExtendHours(Number(e.target.value))}
                      className="w-24 rounded-full px-3 py-2 bg-white border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleExtendAuction}
                      className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Extend auction
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-700">
                    Auction has ended or is missing an end date; it can’t be
                    extended.
                  </p>
                )}
              </div>
            )}

            <label className="text-black font-semibold">
              Image URL (optional if you upload a file)
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Paste image URL"
                type="url"
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
              />
            </label>
            <label className="text-black font-semibold">
              Category ID
              <input
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                placeholder="Numeric category identifier"
                required
                type="number"
                min="1"
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
              />
            </label>
          </div>
        </form>
      </section>
      <Footer />
    </>
  );
};

export default Upload;