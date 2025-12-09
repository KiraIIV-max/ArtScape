import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Register from "./Pages/Register.jsx";
import Upload from "./Pages/Upload.jsx";
import Admin from "./Pages/Admin.jsx";
import Navbar from "./components/Navbar.jsx";
import Bid from "./Bid.jsx";
import Landing from "./Pages/Landing.jsx";
import Buyer from "./Pages/Buyer.jsx";
import Artist from "./Pages/Artist.jsx";
import Artworkwon from "./Pages/Artworkwon.jsx";

function Layout() {
  const location = useLocation();

  // routes where navbar should be hidden
  const hideNavbarRoutes = ["/", "/register"];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bid" element={<Bid />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/artist" element={<Artist />} />
        <Route path="/buyer" element={<Buyer />} />
        <Route path="/artworkwon" element={<Artworkwon />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </StrictMode>
);
