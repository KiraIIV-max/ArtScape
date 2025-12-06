import { useEffect, useState } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";

export function Carousel({ items, render, onElementFocus }) {
  const itemsRefs = [];
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    if (onElementFocus) {
      onElementFocus(itemsRefs[selectedItem]);
      return;
    }

    itemsRefs[selectedItem]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedItem]);

  return (
    <>
      <div className="relative">
        <div
          onClick={() => setSelectedItem(Math.max(0, selectedItem - 1))}
          className="absolute bg-white opacity-45 cursor-pointer rounded-tr-lg rounded-br-lg h-full w-12 bottom-0 left-0 flex justify-center items-center m-0 z-10"
        >
          <SlArrowLeft color="black" className="w-full" />
        </div>
        <div
          onClick={() =>
            setSelectedItem(Math.min(selectedItem + 1, itemsRefs.length - 1))
          }
          className="absolute bg-white opacity-45 cursor-pointer rounded-tl-lg rounded-bl-lg h-full w-12 bottom-0 right-0 flex justify-center items-center m-0 z-10"
        >
          <SlArrowRight color="black" className="w-full" />
        </div>

        <div className="w-screen py-20 flex flex-row space-x-40 overflow-x-scroll snap-x snap-mandatory px-96 items-center">
          {items.map((item, i) => {
            return (
              <div
                ref={(r) => itemsRefs.push(r)}
                style={{
                  transform: i == selectedItem ? "scale(1.5)" : "",
                  transition: "all 0.2s",
                }}
                className="flex py-10 items-center shrink-0 justify-center w-[400px] snap-center"
              >
                {render ? render(item, selectedItem == i) : item}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
