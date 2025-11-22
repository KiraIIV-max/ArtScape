import React, { useRef, useEffect } from "react";
import img1 from "../../src/assets/Modern Art Sculpture.png";
import img2 from "../../src/assets/Vintage Audio Mixing Console.png";
import img3 from "../../src/assets/Modern Stylish Chair.png";
import img4 from "../../src/assets/Sleek Modern Sports Car in Urban Setting.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BestSeller = () => {
  const container = useRef();

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".best-item", {
        opacity: 0,
        y: 50,
        stagger: 0.4,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="mx-25 bg-slate-50  transation duration-300 ease-in-out pb-40 max-w-full"
    >
      <div className=" best-item  text-center">
        <p className="text-red-500 uppercase font-serif">our favorites</p>
        <h1 className="text-7xl py-5 font-serif">Best Sellers</h1>
      </div>
      <div className=" grid grid-cols-4 gap-14 pt-20 ">
        <div className=" best-item  border-b-2">
          <img
            className="h-[450px] object-cover rounded-t-full"
            src={img1}
            alt=""
          />
          <h2 className="text-gray-500 font-serif uppercase py-2">
            Crystal Forms
          </h2>
        </div>
        <div className="best-item border-b-2">
          <img
            className="h-[450px] object-cover w-[330px] rounded-t-full"
            src={img2}
            alt=""
          />
          <h2 className="text-gray-500 font-serif uppercase py-2">
            Classic Camera
          </h2>
        </div>
        <div className="best-item border-b-2">
          <img
            className="h-[450px] object-cover rounded-t-full"
            src={img3}
            alt=""
          />
          <h2 className="text-gray-500 font-serif uppercase py-2">
            Comfort Chair
          </h2>
        </div>
        <div className="best-item border-b-2">
          <img
            className="h-[450px] object-cover rounded-t-full"
            src={img4}
            alt=""
          />
          <h2 className="text-gray-500 font-serif uppercase py-2">
            Sports Car
          </h2>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
