import React, { useEffect, useRef } from "react";
import img1 from "../../src/assets/Contemplation in Motion_ Solitude at the Modern Art Gallery.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Offer = () => {
      const container = useRef();

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".offer-item", {
        opacity: 0,
        y: -200,
        stagger: 0.8,
        duration: 1,
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
    <section className="bg-slate-200 px-12 my-20 py-24 max-w-full grid grid-cols-2 gap-12  ">
      <div>
        <img className="rounded-r-full" src={img1} alt="" />
      </div>
      <div ref={container} className="flex flex-col gap-16 ">
        <p className="offer-item text-red-500 uppercase font-serif">
          Excellence is our standard
        </p>
        <h2 className="offer-item text-7xl uppercase font-serif">What we offer</h2>
        <div className="border-b-2 w-full pb-12 offer-item">
          <h3 className="my-10 font-serif text-4xl mx-4">🌌 Immersive Exhibitions</h3>
          <p className="text-gray-600 mx-10 font-serif"> 
            Our spaces blend light, sound, and design to bring art to life.
            Visitors don’t just view — they experience each piece on a deeper level.
          </p>
        </div>
        <div className="border-b-2 w-full pb-12 offer-item">
          <h3 className="my-10 font-serif text-4xl mx-4">🖼️ Curated Masterpieces</h3>
          <p className="text-gray-600 mx-10 font-serif">
            We hand-select each piece for its emotion, beauty, and story. Every
            artwork is chosen to inspire and resonate deeply with our audience.
          </p>
        </div>
        <div className="border-b-2 w-full pb-12 offer-item">
          <h3 className="my-10 font-serif text-4xl mx-4">🖋️ Artistic Precision</h3>
          <p className="text-gray-600 mx-10 font-serif">
            From layout to typography, every detail is crafted. We blend design
            and storytelling with seamless flow to elevate the visitor journey and create unforgettable moments.
          </p>
        </div>
        <div className="border-b-2 w-full pb-12 offer-item">
          <h3 className="my-10 font-serif text-4xl mx-4">🕊️ Immersive Atmosphere</h3>
          <p className="text-gray-600 mx-10 font-serif">
            Our exhibitions are designed to feel alive. Light, space, and
            movement guide your journey through each artwork, creating a dynamic and engaging experience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Offer;
