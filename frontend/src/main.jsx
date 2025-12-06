import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Register from "./Pages/Register.jsx";
import Upload from "./Pages/Upload.jsx";
import Navbar from "./components/Navbar.jsx";
import App from "./App.jsx";
import Landing from "./Pages/Landing.jsx";

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
        <Route path="/app" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
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
