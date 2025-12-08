import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import gsap from "gsap";

const getRoleFromUser = (user) => {
  if (!user) return undefined;
  const r =
    user.role ||
    user.role_name ||
    user.type ||
    user.user_role ||
    user?.role?.name ||
    (Array.isArray(user.roles) ? user.roles[0]?.name : undefined) ||
    (user.is_admin ? "admin" : undefined);
  return r ? String(r).toLowerCase() : undefined;
};

function Navbar() {
  const location = useLocation();
  const [role, setRole] = useState(() => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) return undefined;
    try {
      const user = JSON.parse(userStr);
      return getRoleFromUser(user);
    } catch {
      return undefined;
    }
  });

  const refreshRole = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      setRole(undefined);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setRole(getRoleFromUser(user));
    } catch {
      setRole(undefined);
    }
  };

  // Re-evaluate auth/role on route change
  useEffect(() => {
    refreshRole();
  }, [location.pathname]);

  // Listen for storage changes (other tabs) and custom auth events (same tab)
  useEffect(() => {
    const onStorage = () => refreshRole();
    const onAuthChanged = () => refreshRole();
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, []);

  // Home fade-in animation
  useEffect(() => {
    if (location.pathname !== "/") return;
    const tl = gsap.timeline();
    tl.to("#nav_ani", { opacity: 1, duration: 1.5, ease: "power2.out" });
    return () => tl.kill();
  }, [location.pathname]);

  return (
    <section
      id="nav_ani"
      className={`transition duration-850 ease-in-out py-6 mx-20 max-w-full flex justify-between
        ${location.pathname === "/" ? "opacity-0" : "opacity-100"}
      `}
    >
      <h1 className="font-bold text-4xl font-style italic">
        ArtScape{" "}
        <img
          src={Photoroom}
          alt="logo"
          className="w-20 h-20 m-0 p-0 inline-block"
        />{" "}
        Universe
      </h1>
      <nav className="my-auto">
        <ul className="flex gap-10 text-xl font-semibold text-black">
          {["Home",  "Bid", "Artist", "Admin" ].map((label) => (
            <li key={label}>
              <Link
                to={`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`}
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}

          {role === "admin" && (
              <Link
                to="/admin"
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                Admin
              </Link>
          )}
          {role === "artist" && (
              <Link
                to="/artist"
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                Artist
              </Link>
          )}
        </ul>
      </nav>
    </section>
  );
}

export default Navbar;