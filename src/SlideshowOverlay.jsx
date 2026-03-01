import Love from "./assets/love.png";
import { useEffect } from "react";
import videoThumbnail from "./assets/thumbnail.avif";
export default function SlideshowOverlay({
  closeModal,
  activeIndex,
  activeMedia,
  nextSlide,
  prevSlide,
}) {
  useEffect(() => {
    // disable body scroll when modal opens
    document.body.style.overflow = "hidden";

    // restore scroll when modal closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  // don’t render until we have something to show
  //make sure you always do a safety net because react might not render everything as quickly as possible
  if (!activeMedia || activeMedia.length === 0) return null;
  return (
    <div
      className="fixed flex flex-col justify-center items-center inset-0 bg-white z-40 overflow-hidden"
      style={{
        backgroundImage: `
                linear-gradient(to bottom, transparent 95%, rgba(0,0,0,0.15) 95%)
                `,
        backgroundSize: "100% 32px, 100% 100%",
        backgroundColor: "#ffffff",
      }}
    >
      <button
        className="absolute top-8 right-10 lg:right-16 text-black text-4xl font-display cursor-pointer"
        onClick={closeModal}
        aria-label="Close Slideshow"
      >
        X
      </button>
      <div className="relative flex flex-col hidden lg:flex md:flex justify-center items-center w-full">
        <button
          onClick={nextSlide}
          className="absolute top-1/2 left-[5%] lg:left-[20%] -translate-y-1/2 
             w-12 h-12 rounded-full 
             bg-[#7a2e4d]/80 text-white 
             flex items-center justify-center
             shadow-lg backdrop-blur-sm
             hover:scale-105 hover:bg-[#7a2e4d]
             transition-all duration-200 ease-in
             cursor-pointer"
        >
          &lsaquo;
        </button>
        <button
          onClick={prevSlide}
          className="absolute top-1/2 right-[5%] lg:right-[20%] -translate-y-1/2 
             w-12 h-12 rounded-full 
             bg-[#7a2e4d]/80 text-white 
             flex items-center justify-center
             shadow-lg backdrop-blur-sm
             hover:scale-105 hover:bg-[#7a2e4d]
             transition-all duration-200 ease-in
             cursor-pointer"
        >
          &rsaquo;
        </button>
        <div
          className={`w-[60%] md:w-[35%] lg:w-[20%] pb-3 pt-2 pt-4 px-3 bg-white shadow-sm shadow-black`}
        >
          {activeMedia[activeIndex].type === "image" ? (
            <img
              alt="Media"
              src={
                activeMedia[activeIndex].url ||
                activeMedia[activeIndex].previewURL
              }
              className="w-full max-h-[300px] object-cover border-1 border-[#cccccc]"
            />
          ) : (
            <video
              src={
                activeMedia[activeIndex].url ||
                activeMedia[activeIndex].previewURL
              }
              className="w-full max-h-[200px] object-cover border-1 border-[#cccccc]"
              poster={videoThumbnail}
              controls
              onClick={(e) => e.stopPropagation()}
            ></video>
          )}
          <img src={Love} alt="Sticker" className="w-[15%] pt-2" />
        </div>
      </div>
      {/*this is the mobile version of the slides overflow-x-auto basically makes it into a horizontal scrollbar if the slideshow is out of view*/}
      <div className="lg:hidden md:hidden flex flex-row overflow-x-auto snap-x snap-mandatory gap-2 p-6">
        {/*We use snap-x which is the scroll snap type, which helps to make the slideshows much smmother, as it will lock on one of the slides
      snap-x means that it is focusing on horizontal movement/snapping, and snap-mandatory means when the scrolling stops, it must lock onto something */}
        {activeMedia.map((item, index) => (
          <div
            key={index}
            className={`pb-3 pt-6 pt-4 px-4 bg-white shadow-md shadow-black snap-center shrink-0 w-full`}
          >
            {/*on each slide created it will lock onto the center of the div, it will not shrink and it will take the full size - When snapping happens, align me to the centre of the container.*/}
            {item.type === "image" ? (
              <img
                alt="Media"
                src={item.url || item.previewURLL}
                className="w-full max-h-[400px] object-cover"
              />
            ) : (
              <video
                src={item.url || item.previewURL}
                className="w-full max-h-[400px] object-cover"
                controls
                onClick={(e) => e.stopPropagation()}
              ></video>
            )}
            <img src={Love} alt="Sticker" className="w-[15%] pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}