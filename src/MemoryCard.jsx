import { useEffect, useRef, useState } from "react";
import Love from "./assets/love.png";
import videoThumbnail from "./assets/thumbnail.avif";
export default function MemoryCard({
  id,
  date,
  title,
  mood,
  note,
  media,
  deleteID,
  openModal,
  hideText,
  newText,
  setNewText,
  handleNote,
  errorNoteId,
  handleEscape,
  trackingEditID,
  editingId,
  cancelEdit,
}) {
  // check if this specific card is the one currently being edited
  // editingId is stored in Home and represents the active card
  // if this card’s id matches editingId, then this card should show the edit form
  // if not, nothing happens for this card
  const activeCard = editingId === id;

  const cardRef = useRef(null); //we will use this as the reference for each card for it to be observed
  const [isVisible, setIsVisible] = useState(false); //this is the state responsible for what happens if the card shows up on the viewport

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsVisible((prev) => true);
        observer.unobserve(entry.target); //this will basically stop it observing the element
      }
    });

    observer.observe(cardRef.current);
  }, []);
  return (
    <article
      className={`relative w-full max-w-sm md:max-w-2xl lg:max-w-3xl bg-white border-2 border-black p-3 pb-8 rounded-lg ${
        isVisible ? "translate-y-0" : "translate-y-13"
      } transition-transform ease duration-300`}
      ref={cardRef}
    >
      <div className="absolute -top-5  w-34 h-8 rounded-md shadow-sm bg-[#f5e6c8] opacity-70"></div>
      <button
        type="button"
        className="absolute top-5 right-5 cursor-pointer font-bold font-display"
        aria-label="Click to delete memory"
        onClick={() => deleteID(id)}
      >
        X
      </button>
      <div className="flex flex-wrap flex-row w-full gap-2 font-display pt-4">
        <div>
          <span aria-hidden="true" className="text-2xl">
            {mood}
          </span>
        </div>
        <div>
          <h2 className="weight-300 font-bold text-lg">{title}</h2>
        </div>
        <div className="px-3">
          <time dateTime={date} className="font-bold text-lg">
            {new Date(date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
        {/*We use the time for the dates and toDateString makes the dates look much better for UX design*/}
      </div>
      <div className="flex flex-row p-2 gap-4">
        <p className="text-sm lg:text-lg font-display">{note}</p>
        {!activeCard && (
          <button
            className="text-sm font-bold text-[#F9A8D4] font-display cursor-pointer"
            onClick={() => {
              hideText();
              trackingEditID(id);
              setNewText(note);
            }}
            aria-label="Show the edit input"
            type="button"
          >
            Edit Note
          </button>
        )}
      </div>
      {errorNoteId === id && (
        <p className="text-md font-bold text-red-500 font-display">
          Please enter text!
        </p>
      )}
      {activeCard && (
        <div className="font-display flex text-sm font-bold gap-2">
          <form
            onSubmit={(e) => handleNote(e, id, newText)}
            className="flex flex-row w-full max-w-md gap-2"
          >
            <input
              type="text"
              className="w-full p-2 border-1 border-black mb-2 text-black text-base"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleEscape}
            />
            <button
              className="text-[#F9A8D4] cursor-pointer text-md"
              aria-label="Save edit"
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[#F9A8D4] cursor-pointer text-md"
              aria-label="Save edit"
            >
              Save
            </button>
            {/*this is the form to edit the note, when the user clicks on edit note, the form will be shown and the note will be hidden, when the user submits the form, the note will be updated and the form will be hidden again*/}
          </form>
        </div>
      )}
      {media.length > 0 && (
        <div className="relative flex flex-col w-full gap-2">
          <div
            className={`w-[60%] md:w-[35%] lg:w-[35%] pb-3 pt-2 pt-4 px-3 bg-white shadow-sm shadow-black ${
              media.length > 1 ? "cursor-pointer" : ""
            }`}
            onClick={media.length > 1 ? () => openModal(media) : undefined}
          >
            {/*This basically means the slideshow is only possible if theres more than one file otherwise it will not work - undefined */}
            {media[0].type === "image" ? (
              <img
                src={media[0].url || media[0].previewURL} //so if its firebase it will use url and if its demo it will be previewurl
                alt="Media"
                className="w-full max-h-[200px] object-cover border-1 border-[#cccccc]"
              />
            ) : (
              <video
                src={media[0].url || media[0].previewURL}
                className="w-full max-h-[200px] object-cover border-1 border-[#cccccc]"
                poster={videoThumbnail}
                controls
                onClick={(e) => e.stopPropagation()}
              ></video>
            )}
            <img src={Love} alt="Sticker" className="w-[20%] pt-2" />
          </div>
          {media.length > 1 && (
            <span
              className="font-bold font-display cursor-pointer"
              onClick={() => openModal(media)}
            >
              View More ({media.length - 1})
            </span>
          )}
        </div>
      )}
    </article>
  );
}