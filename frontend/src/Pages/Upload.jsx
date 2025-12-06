import React from "react";
import { FiUpload } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const Upload = () => {
  return (
    <>
      <section className="mx-20">
        <h1 className="text-4xl text-center pb-14">Upload Your Art</h1>
        <div>
          <form action="" className="flex gap-18">
            <div className="w-[650px] flex flex-col items-center gap-30">
              <label
                htmlFor="file"
                className="w-full border-2 border-dashed border-gray-400
 h-70 flex flex-col gap-2 items-center justify-center bg-gray-200 rounded-xl cursor-pointer hover:bg-gray-300 transition"
              >
                <FiUpload className="w-8 h-8 text-gray-600" />

                <span className="text-gray-700 font-medium">
                  Upload your art
                </span>
              </label>

              <input id="file" type="file" className="hidden  " />
              <button
                type=""
                className=" cursor-pointer  text-xl w-fit transation duration-300 ease-in-out  group hover:-translate-y-1.5 hover:scale-105  z-20  px-6 py-2 text-white  relative overflow-hidden"
              >
                Upload Art
                <span className="absolute left-0 bottom-0 rounded-xl  w-full  bg-blue-600 -z-10 h-full transition-all duration-500 ease-in-out"></span>
              </button>
            </div>
            <div className="flex flex-col gap-10">
              <label className=" text-black font-semibold">
                Full Name{" "}
                <input
                  placeholder="Enter your name"
                  required
                  type="text"
                  name="name"
                  className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
                />
              </label>
              <label className=" text-black font-semibold">
                Email{" "}
                <input
                  placeholder="Enter your email"
                  required
                  type="email"
                  name="email"
                  className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200"
                />
              </label>
              <label className=" text-black font-semibold">
                Discription{" "}
                <textarea
                  placeholder="Discribe your art"
                  required
                  type="text"
                  name="description"
                  className="  block rounded-xl w-xl ml-3 px-10 py-25 bg-gray-200"
                ></textarea>
              </label>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Upload;
