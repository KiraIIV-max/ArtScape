import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import gsap from "gsap";
import Features from "../components/Features.jsx";
import BestSeller from "../components/BestSeller.jsx";
import Why from "../components/Why.jsx";
import Offer from "../components/Offer.jsx";
import Footer from "../components/Footer.jsx";

const Landing = () => {
  useEffect(() => {
    const tl = gsap.timeline();
    tl.to("#overlay", {
      opacity: 0,
      duration: 1.8,
      delay: 0.2,
      ease: "power2.out",
    })
      .set("#overlay", { display: "none" })
      .fromTo(
        "#hero-text",
        { clipPath: "inset(0 100% 0 0 )", x: -300, scale: 1.5, opacity: 0 },
        {
          clipPath: "inset(0 0 0 0)",
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.00001,
          ease: "power2.out",
        }
      )
      .fromTo(
        "#hero-section",
        { backgroundPosition: "center center", backgroundSize: "150%" },
        {
          backgroundPosition: "center center",
          backgroundSize: "100%",
          duration: 2.2,
          ease: "power2.out",
        },
        "-=1.2"
      );
  }, []);
  return (
    <>
      <section
        id="hero-section"
        className="max-w-full  "
        style={{
          backgroundImage:
            'url("../src/assets/Modern Art Gallery Interior.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          transation: "background-size 2s ease-in-out",
        }}
      >
        <Navbar />
        <div
          id="overlay"
          className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-3xl z-50"
        ></div>

        <div
          id="hero-text"
          className=" px-16 transition duration-850 ease-in-out ml-6 absolute top-1/3 uppercase z-50"
        >
          <p className="text-xl">Inspire the World</p>
          <h1 className="text-8xl leading-27 font-serif">
            where Art <br /> comes Alive
          </h1>
          <button className="text-xl group uppercase mt-8 z-20 ml-5 px-4 py-2 hover:text-white transition duration-500 ease-in-out relative overflow-hidden">
            <Link to="/register">Register Now</Link>
            <span className="absolute left-0 bottom-0 rounded-xl  w-full bg-black h-0.5 -z-10 group-hover:h-full transition-all duration-500 ease-in-out"></span>
          </button>
        </div>
      </section>
      <Features />
      <BestSeller />
      <Why />
      <Offer />
      <Footer />
    </>
  );
};

export default Landing;
