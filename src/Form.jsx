import { useEffect, useState } from "react";
import { storage } from "./firebase"; //this will be used to connect the app with our stprage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
//ref creates a reference to a path in our storage system, basically says where it should store the file
//uploadbytes helps to upload the file
//getDownloadURL this allows Firebase to give the file a public URL (secure, but accessible).
export default function Form({
  isOpen,
  setIsOpen,
  addMemory,
  mode,
  journalId,
}) {
  const [date, setDate] = useState(
    // gets today’s date in YYYY-MM-DD format
    // new Date() creates the current date/time
    // toISOString() converts it to a full ISO string (includes time)
    // split("T")[0] removes the time and keeps only the date part
    new Date().toISOString().split("T")[0]
  );

  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [media, setMedia] = useState([]);
  const [preparedMedia, setPreparedMedia] = useState([]);
  // This preparedMedia state exists because the slideshow needs multiple URLs so it can have the images in place
  // Files from the input aren’t usable in the UI on their own,
  // so we prepare them once here instead of recreating URLs everywhere.
  // Each item will be turned into an object with:
  // - the original file
  // - a simple type ("image" or "video")
  // - a preview URL so we can show it on the card / slideshow

  //media = [file1, file2] this is how it would be if we used the media state
  //preparedMedia = [
  // { URL: "imag" },
  // { URL: "image2" }
  //]

  useEffect(() => {
    // If the user hasn’t selected any files yet
    // make sure preparedMedia is empty, basically when u select the files because we use onChange, it can update the preparedMedia form as it is
    if (media.length === 0) {
      setPreparedMedia([]);
      return;
    }

    // Turn each File into something the UI understands
    const next = media.map((file) => ({
      file, //we loop and grab each file
      // keep the original file in case we upload later
      // clean up the type so we don’t deal with
      // image/png, image/jpeg, video/mp4 etc
      type: file.type.startsWith("image/") ? "image" : "video",
      // this creates a temporary URL so the browser
      // can preview local files before upload
      previewURL: URL.createObjectURL(file),
    }));

    // save the prepared media so the card can render it
    setPreparedMedia(next);

    // we use forEach here because we’re not creating a new array
    // we’re just running a cleanup action for every media item
    // map would be wrong because map is meant to RETURN a new array
    // here we only want to revoke the URLs to free memory
    return () => {
      next.forEach((m) => URL.revokeObjectURL(m.previewURL));
    };
  }, [media]); // runs whenever selected files change

  const uploadOneFile = async (file) => {
    const type = file.type.startsWith("image/") ? "image" : "video";

    // if we don’t have journalId, we can’t upload to the right journal folder
    if (!journalId) throw new Error("No journalId found for upload");

    // make the file name unique so two files don’t overwrite each other
    const safeName = `${Date.now()}-${file.name}`;

    // this is the storage "address" (where the file will live)
    // journals/{journalId}/media/{filename}
    const fileRef = ref(storage, `journals/${journalId}/media/${safeName}`);

    // upload the file to storage
    await uploadBytes(fileRef, file);

    // get the real URL we can save + use forever
    const url = await getDownloadURL(fileRef);

    // return the same shape your app already expects
    return { type, url };
  };

  const fileToBase64 = (file) => {
    // We return a Promise because reading files takes time.
    // The browser doesn't instantly give us the file contents.
    // So we wrap it in a Promise so we can use "await" later.

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // FileReader is a built-in browser tool.
      // It reads files from the user's device.

      // When the file finishes loading,
      // reader.result becomes a base64 "data URL" string.
      // Example:

      reader.onload = () => resolve(reader.result);

      // If something goes wrong while reading the file,
      // reject the promise so we can catch the error safely.
      reader.onerror = () => reject(new Error("File could not be read"));

      // This tells the browser:
      // "Read this file and convert it into a base64 data URL string."
      // That string can later be used directly in <img src="..." />
      reader.readAsDataURL(file);
    });
  };

  const handleForm = async (e) => {
    e.preventDefault();

    const id =
      window.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    // create a unique id (mobile-safe)

    // this is what we’re actually going to save inside the memory object
    // it will be different depending on whether we’re in demo or auth
    let finalMedia = [];

    // DEMO MODE → we can’t store blob preview URLs because they die on refresh
    if (mode === "demo") {
      // localStorage is small (around 5MB total)
      // so if someone uploads something massive it’ll break
      // this just stops that from happening silently
      const tooBig = media.some((f) => f.size > 1_500_000);
      if (tooBig) {
        alert("Demo mode: keep files small (max ~1.5MB each).");
        return;
      }

      // here we take the real File objects (not preparedMedia)
      // and convert each one into a base64 string so it can survive refresh
      finalMedia = await Promise.all(
        media.map(async (file) => {
          // clean up the file type so we only deal with "image" or "video"
          const type = file.type.startsWith("image/") ? "image" : "video";

          // this converts the file into a long base64 string
          // example: data:image/png;base64,iVBORw0KGgo...
          const url = await fileToBase64(file);

          // we return it in the same shape auth mode uses
          // so the UI doesn’t care where it came from
          return { type, url };
        })
      );
    }

    // ✅ if we are in real login mode, we upload files to Firebase Storage
    if (mode === "auth") {
      if (!journalId) {
        alert("No journal found yet. Create or join one first.");
        return;
      }

      // upload every selected file + return real URLs
      finalMedia = await Promise.all(
        preparedMedia.map((m) => uploadOneFile(m.file)) //this will create an array and run the actual function for these files
      );
    }

    const newMemory = {
      id,
      date,
      title,
      mood,
      note,
      media: finalMedia,
    };

    await addMemory(newMemory);

    // reset form
    setTitle("");
    setMood("");
    setNote("");
    setMedia([]);
    setPreparedMedia([]);
    setIsOpen(false);
  };
  return (
    <section
      className={`flex flex-col justify-content items-center fixed bottom-0 w-full ${
        !isOpen ? "translate-y-full overflow-hidden" : "translate-y-0"
      } transition-transform ease duration-200 px-2 z-60`}
    >
      <form
        onSubmit={handleForm}
        className="relative flex flex-col gap-3 w-full max-w-4xl bg-white p-10 md:p-14 lg:p-14 border-l border-t border-r border-[#cccccc] md:border-2 md:border-[#cccccc] lg:border-2 lg:border-[#cccccc] font-display"
      >
        <div className="absolute top-0 -left-10 -rotate-25 w-34 h-8 rounded-md shadow-sm bg-[#f5e6c8]"></div>
        <div className="absolute top-1 -right-10 rotate-30 w-34 h-8 rounded-md shadow-sm bg-[#f5e6c8]"></div>
        <button
          type="button"
          className="absolute top-5 right-15 cursor-pointer font-bold"
          aria-label="Click to close form"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }}
        >
          X
        </button>
        <div className="flex flex-row gap-2 pt-3">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
          />
        </div>
        {/*This is used to create the default date for the input*/}
        <div className="flex flex-row gap-2">
          <label htmlFor="text">Title:</label>
          <input
            type="text"
            id="text"
            name="title"
            required
            placeholder="Summarise this day"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
          />
        </div>
        <div className="flex flex-row gap-2">
          <label htmlFor="mood">Mood:</label>
          <select
            name="mood"
            id="mood"
            value={mood}
            required
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="" disabled>
              Select a mood
            </option>
            <option value="🥰">🥰</option>
            <option value="😠">😠</option>
            <option value="💩">💩</option>
            <option value="😋">😋</option>
            {/*this will be the emojis the user can select for the mood*/}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="note">Note:</label>
          <textarea
            id="note"
            name="note"
            required
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
          ></textarea>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="media">Photo/Video:</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            id="media"
            name="media"
            onChange={(e) => setMedia(Array.from(e.target.files))}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg shadow-sm text-[#4a154b] placeholder:text-[#b8aeb3] transition-all duration-200 mb-8"
          />
          {/*This will help the user select videos or photos and it will only accept them*/}
        </div>
        <button
          type="submit"
          className="w-full p-4 px-6 py-2 font-display text-lg bg-[#ffb6d9] text-white border-2 border-black rounded-2xl cursor-pointer"
          aria-label="Add Memory"
        >
          Add Memory
        </button>
      </form>
    </section>
  );
}