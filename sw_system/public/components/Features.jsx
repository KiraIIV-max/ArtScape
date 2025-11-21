import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const container = useRef();

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".feature-item", {
        opacity: 0,
        y: 50,
        stagger: 0.25,
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
      id="Features"
      className="bg-slate-50 mx-10 my-24 pb-40 max-w-full grid grid-cols-2 gap-12 px-16 py-6"
    >
      <div className="feature-item">
        <p className="text-red-500 uppercase font-serif">features</p>
        <h1 className="text-7xl font-serif">our values</h1>
      </div>

      <div className="feature-item border-t-2 w-full pb-12">
        <h2 className="my-10 font-serif text-4xl mx-4">
          🎨 Curated Masterpieces
        </h2>
        <p className="text-gray-600 mx-10 font-serif">
          Carefully hand-selected artworks.
        </p>
      </div>

      <div className="feature-item border-t-2 w-full pb-12">
        <h2 className="my-10 font-serif text-4xl mx-4">
          🖼️ Artistic Immersion
        </h2>
        <p className="text-gray-600 mx-10 font-serif">
          Visuals that feel alive and expressive.
        </p>
      </div>

      <div className="feature-item border-t-2 w-full pb-12">
        <h2 className="my-10 font-serif text-4xl mx-4">
          📸 Designed to Inspire
        </h2>
        <p className="text-gray-600 mx-10 font-serif">
          Every detail crafted to elevate your journey.
        </p>
      </div>
    </section>
  );
};

export default Features;
