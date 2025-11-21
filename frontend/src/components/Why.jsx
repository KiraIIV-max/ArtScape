import React, { useRef, useEffect } from "react";
import img1 from "../../src/assets/Art Gallery Observer.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Why = () => {
  const container = useRef();

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".why-item", {
        opacity: 0,
        x: -300,
        stagger: 0.4,
        duration: 1.4,
        scale: 1.7,
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
    <section className="grid  grid-cols-2 mx-25 pb-52 gap-15 duration-300 ease-in-out ">
      <div ref={container}>
        <p className="why-item text-red-500 uppercase font-serif">why us ?</p>
        <h1 className="why-item text-7xl py-7 font-serif">why choose us ?</h1>
        <p className="why-item font-serif py-3 text-xl text-gray-500">
          At ArtScape Universe, we believe every creation tells a story. Our
          exhibitions are more than displays — they are journeys into
          imagination, crafted with passion and precision. We hand‑select each
          piece to ensure it resonates with emotion, creativity, and meaning.
          From timeless classics to bold contemporary works, every detail is
          chosen to inspire and captivate.
        </p>
        <button className="why-item text-md tracking-widest group uppercase  py-2  ">
          <a href="">
            learn more <span className="  text-2xl">↗</span>
          </a>
          <span className="absolute left-0 bottom-0 bg-gray-800 w-0 h-0.5 group-hover:w-full transition-all duration-500 ease-in-out"></span>
        </button>
      </div>
      <div className="relative">
        <img
          className="rounded-full drop-shadow-blue-100 drop-shadow-xl "
          src={img1}
          alt=""
        />
        <span className="bg-[#858b93] w-[630px] h-[354px] rounded-full absolute top-30 -z-10 right-20 "></span>
      </div>
    </section>
  );
};

export default Why;
