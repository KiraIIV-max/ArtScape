import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import gsap from "gsap";
import { Link } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return; // only animate on home
    const tl = gsap.timeline();
    tl.to("#nav_ani", {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
    });
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
          {["Home", "Contact", "Bid", "Art", "Time"].map((label) => (
            <li key={label}>
              <Link
                to={`/${
                  label.toLowerCase() === "home" ? "" : label.toLowerCase()
                }`}
                className="transition duration-300 ease-in-out hover:text-sky-800 hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

export default Navbar;
