import { useEffect, useMemo, useState } from "react";
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
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (artwork) {
      setForm({
        title: artwork.title || "",
        description: artwork.description || "",
        starting_price: artwork.starting_price || "",
        image_url: artwork.image_url || "",
        category_id: artwork.category_id || "",
      });
      setPreview(artwork.image_url || "");
    }
  }, [artwork]);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${storedToken}`,
      Accept: "application/json",
      // DO NOT set Content-Type here for FormData
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
      setStatusMessage("You must be logged in to submit artwork.");
      return;
    }
    if (!form.category_id) {
      setStatusMessage("Please provide a category ID.");
      return;
    }

    const endpoint = isEditing
      ? `${API_BASE_URL}/artist/artworks/${artwork.artwork_id || artwork.id}`
      : `${API_BASE_URL}/artist/artworks`;
    const method = isEditing ? "POST" : "POST"; // use POST + _method for edit

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("starting_price", Number(form.starting_price));
    fd.append("category_id", Number(form.category_id));

    // If you want to upload a file:
    if (file) {
      fd.append("image", file); // backend should expect 'image'
    } else if (form.image_url) {
      // If backend supports image_url, append it too
      fd.append("image_url", form.image_url);
    }

    if (isEditing) {
      fd.append("_method", "PUT");
    }

    setSubmitting(true);
    setStatusMessage("");

    try {
      const res = await fetch(endpoint, {
        method,
        headers,
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to save artwork.");
      setStatusMessage(isEditing ? "Artwork updated successfully." : "Artwork uploaded!");
      navigate("/artist");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

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