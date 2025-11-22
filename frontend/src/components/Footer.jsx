import React from "react";
import imgFooter from "../../src/assets/ChatGPT Image Nov 18, 2025, 07_13_13 PM.png";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <section className="pt-15">
        <hr className="w-10/12 m-auto h-0.5 bg-gray-400" />
      <footer className="   mx-10  pb-6  pt-6 grid grid-cols-3 gap-10">
        <div className="  text-center mt-14 ">
          <ul className="flex gap-8 flex-col text-xl font-semibold text-black">
            {["About", "Contact", "Bid", "Art", "Time"].map((label) => (
              <li key={label}>
      <Link
        to={`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`}
        className=" pb-6  border-b-2 block transition duration-300 ease-in-out hover:-translate-y-2 "
                >

        {label}
      </Link>
    </li>
            ))}
          </ul>
          <div className=" ml-19 mt-8 flex gap-4 text-xl">
            {/* Social Icons (replace with actual icons if needed) */}
            <span>📷</span>
            <span>📘</span>
            <span>💼</span>
            <span>🐦</span>
            <span>🎨</span>
            <span>🎵</span>
          </div>
        </div>
        <div className="text-center border-r-2 border-l-2 space-x-4 px-8">
          <h1 className="font-bold text-2xl font-style italic">
            ArtScape{" "}
            <img
              src={Photoroom}
              alt="logo"
              className="w-20 h-20 m-0 p-0 inline-block"
            />{" "}
            Universe
          </h1>
          <p className="text-sm text-gray-500 py-4">ATELIER</p>
          <img className=" " src={imgFooter} alt="" />
          <h2 className="uppercase text-gray-800 py-4 ">
            Dreaming of the Perfect Bouquet?
          </h2>
          <p className="text-gray-700">Contact Us Today!</p>
        </div>
        <div className=" mt-14 flex flex-col gap-10 text-center max-w-[350px]">
          <p>🚚 <br />Delivery Daily since 2010</p>
          <p>
            🕒 <br /> Monday - Friday: 8AM - 6PM <br /> Saturday: 8AM - 1PM <br /> Sunday:
            Closed
          </p>
          <p>📞 <br /> +201550611702</p>
          <p>📧 <br /> info@email.com</p>
          <p>
             🏠 <br /> 123 Example Road <br /> New York, NY 12345
          </p>
        </div>
      </footer>
      <hr className="w-full h-0.5 bg-gray-400" />
      
      <div className="flex justify-around py-4 bg-sky-900 text-white">
        <p>© Flora & Grace. All rights reserved 2025</p>
        <p>Privacy Policy | Terms & Conditions</p>
      </div>
    </section>
  );
};

export default Footer;
