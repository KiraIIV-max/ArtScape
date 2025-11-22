import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Landing from "./Pages/Landing.jsx";
import Register from "./Pages/Register.jsx";
import Upload from "./Pages/Upload.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
