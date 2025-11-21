import img from "../../src/assets/clip-message-sent 1.png";
import Photoroom from "../../src/assets/1-2Photoroom.png";
import Navbar from "../components/Navbar";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


const Register = () => {
    const container = useRef();

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".reg-item", {
        opacity: 0,
        x: -300,
        delay: 0.2,
        duration: 4,
        ease: "power2.out",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <section ref={container} className="ml-10  gap-10 items-center justify-center h-screen flex-row flex">
      <div className="mx-20 my-8">
        <div className="pb-14">
          <h1 className="font-bold text-4xl font-style italic">
            ArtScape{" "}
            <img
              src={Photoroom}
              alt="logo"
              className="w-20 h-20 m-0 p-0 inline-block"
            />{" "}
            Universe
          </h1>
        </div>
        <div>
          <p className=" uppercase font-serif text-gray-500 text-sm ">
            start for free
          </p>
          <h1 className="text-5xl pb-3 font-serif">
            Medhat is here <span className="text-7xl text-blue-600">.</span>
          </h1>
          <p className="uppercase text-gray-500 text-sm">
            Already have an account?{" "}
            <span className=" text-blue-600">Log In</span>
          </p>
        </div>
        <form className="w-full flex flex-col gap-7 mt-10">
          <label className=" text-black font-semibold">
            Name{" "}
            <input
              placeholder="Enter your name"
              required
              type="text"
              name="name"
              className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
            />
          </label>
          <label className=" text-black font-semibold">
            email{" "}
            <input
              placeholder="Enter your email"
              required
              type="email"
              name="name"
              className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
            />
          </label>
          <label className=" text-black font-semibold">
            password{" "}
            <input
              placeholder="Set a password"
              required
              type="password"
              name="name"
              className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
            />
          </label>
          <div className=" ml-28 flex gap-20">
            <button className=" cursor-pointer text-xl w-fit transation duration-300 ease-in-out  group hover:-translate-y-1.5 hover:scale-105 mt-8 z-20 ml-5 px-4 py-2 text-white  relative overflow-hidden">
              Log in
              <span className="absolute left-0 bottom-0 rounded-full  w-full bg-blue-600 -z-10 h-full transition-all duration-500 ease-in-out"></span>
            </button>
            <button className="cursor-pointer  text-xl w-fit transation duration-300 ease-in-out  group hover:-translate-y-1.5 hover:scale-105 mt-8 z-20 ml-5 px-4 py-2 text-white  relative overflow-hidden">
              create account
              <span className="absolute left-0 bottom-0 rounded-full  w-full bg-blue-600 -z-10 h-full transition-all duration-500 ease-in-out"></span>
            </button>
          </div>
        </form>
      </div>
      <div 
        className="  ">
          <span className=" absolute top-0 right-0 -z-10 bg-slate-50 w-1/2 h-full" ></span>
        <img   src={img} alt="art" className=" reg-item w-full h-full object-cover" />
      </div>
    </section></>
  );
};

export default Register;
