import { Carousel } from "./components/Carousel";
import { MdOutlineCalendarMonth } from "react-icons/md";
import "./winnerHeader.css";

export default function Bid() {
  function renderCarouselElement(data, inFocus) {
    return (
      <div>
        <img className="w-full aspect-auto" src={data} />
        <div className="w-full h-52 py-2 px-1">
          {inFocus && (
            <>
              <div className="flex flex-row justify-between">
                <span className="font-medium text-[0.6rem] text-white bg-black flex flex-row justify-center items-center px-2 py-0.5">
                  PABLO PICASSO
                </span>
                <span className="font-medium text-[0.6rem] font-mono text-white bg-black flex justify-center items-center px-1 py-0.5">
                  00:00:00
                </span>
              </div>
              <div className="p-2 mt-3 border-gray-300 border-[0.8px] shadow-md shadow-gray-300 rounded-lg">
                <h1 className="font-bold text-[0.8rem] mb-3">
                  Bidding History
                </h1>

                <div className="text-right m-0 p-0">
                  <span className="winnerHeader text-white text-[0.5rem] p-1 font-mono">
                    WINNER
                  </span>
                </div>

                <div className="text-[0.7rem] grid grid-cols-2 *:self-center border border-black rounded-xl rounded-tr-none p-2">
                  <span className="self-center">Mohamed Ibrahim</span>
                  <span className="text-lg text-right font-bold">
                    $2000
                    {/* <span className="text-green-800 text-[0.7rem]">(+$20)</span> */}
                  </span>
                  <span className="flex flex-row items-center gap-1">
                    <MdOutlineCalendarMonth stroke="" /> 6 Dec 2025
                  </span>

                  <span className="font-mono text-right">10:00 AM</span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="text-[0.7rem] grid grid-cols-2 *:self-center p-2">
                    <span className="self-center">Ahmed Saaed</span>
                    <span className="text-right">
                      $1300
                      {/* <span className="text-green-800 text-[0.7rem]">(+$20)</span> */}
                    </span>
                    <span className="flex flex-row items-center gap-1">
                      <MdOutlineCalendarMonth stroke="" /> 5 Dec 2025
                    </span>

                    <span className="font-mono text-right">4:00 PM</span>
                  </div>

                  <div className="text-[0.7rem] grid grid-cols-2 *:self-center p-2">
                    <span className="self-center">Hamza Shafek</span>
                    <span className="text-right">
                      $1000
                      {/* <span className="text-green-800 text-[0.7rem]">(+$20)</span> */}
                    </span>
                    <span className="flex flex-row items-center gap-1">
                      <MdOutlineCalendarMonth stroke="" /> 1 Dec 2025
                    </span>

                    <span className="font-mono text-right">11:00 AM</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function carouselElementSelect(ref) {
    ref.querySelector("img").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  return (
    <>
      <Carousel
        items={new Array(10).fill(
          "https://artevenue.com/static/image_data/POD/images/33_V674D_lowres.jpg"
        )}
        render={renderCarouselElement}
        onElementFocus={carouselElementSelect}
      />
    </>
  );
}
