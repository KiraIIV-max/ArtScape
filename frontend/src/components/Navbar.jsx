import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const refreshRole = () => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      setRole(undefined);
      setUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(userStr);
      setRole(getRoleFromUser(parsed));
      setUser(parsed);
    } catch {
      setRole(undefined);
      setUser(null);
    }
  };

  // Re-evaluate auth/role on route change
  useEffect(() => {
    // schedule refresh to avoid synchronous setState inside effect
    const t = setTimeout(() => refreshRole(), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Ensure we refresh role on mount and try to hydrate user from API if missing
  useEffect(() => {
    refreshRole();

    // If token exists but no user in localStorage, try to fetch /api/me
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (token && !raw) {
      (async () => {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/me', { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return;
          const j = await res.json();
          if (j) {
            localStorage.setItem('user', JSON.stringify(j));
            window.dispatchEvent(new Event('auth-changed'));
            refreshRole();
          }
        } catch (e) {
          // ignore
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for storage changes (other tabs) and custom auth events (same tab)
  useEffect(() => {
    const onStorage = () => refreshRole();
    const onAuthChanged = () => refreshRole();
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged);
    // close dropdown on outside click
    const onClickOutside = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', onClickOutside);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener('click', onClickOutside);
    };
  }, [open]);

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
        ${(!user && location.pathname === "/") ? "opacity-0" : "opacity-100"}
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
      <nav className="my-auto flex items-center gap-6">
        <ul className="flex gap-8 text-xl font-semibold text-black">
          {["Home",  "Bid"].map((label) => (
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
            <li>
              <Link
                to="/admin"
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                Admin
              </Link>
            </li>
          )}
          {role === "artist" && (
            <li>
              <Link
                to="/artist"
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                Artist
              </Link>
            </li>
          )}
        </ul>

        <div className="ml-6 relative" ref={dropdownRef}>
          {!user ? (
            <div className="flex gap-3 items-center">
              <Link to="/register" className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800">Login</Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="px-3 py-2 rounded bg-gray-900 text-white flex items-center gap-2"
                aria-expanded={open}
              >
                {user?.name || user?.username || user?.email || 'User'}
                <span className="text-xs opacity-80">▾</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-40">
                  <div className="p-3 text-sm text-gray-700">
                    <div className="font-semibold">{user?.name || user?.email}</div>
                    <div className="text-xs text-gray-500">{role ? role.toUpperCase() : 'User'}</div>
                  </div>
                  <div className="border-t" />
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => {
                          // logout locally
                          localStorage.removeItem('auth_token');
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.dispatchEvent(new Event('auth-changed'));
                          setOpen(false);
                          setRole(undefined);
                          setUser(null);
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </section>
  );
}

export default Navbar;