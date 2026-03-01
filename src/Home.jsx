import Form from "./Form";
import MemoryCard from "./MemoryCard";
import OpenFormButton from "./openFormButton";
import JournalSetup from "./JournalSetup";
import Logo from "./assets/logo.png";
import { useState } from "react";
import { useEffect } from "react";
import Yearbar from "./Yearbar";
import Splashscreen from "./Splashscreen";
import Modal from "./ModAL";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";
import { HiOutlineLogout } from "react-icons/hi";
import { LogOut } from "lucide-react";
import { collection } from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { query, where, limit } from "firebase/firestore"; //this is used to check if an journal exists
import { deleteDoc } from "firebase/firestore"; //this will be used to delete the data
import { updateDoc } from "firebase/firestore"; //this will be used to edit the notes
import { arrayUnion } from "firebase/firestore"; //this will be used to add the other user into the journal members list
import { db } from "./firebase";
import { getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore"; //(to create a new document)
import { serverTimestamp } from "firebase/firestore"; // (so Firestore sets a “createdAt” time consistently)
const DEMO_KEY = "demo_memories";
export default function Home({ mode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [memories, setMemories] = useState([]);
  const [activeYear, setActiveYear] = useState(null); //this is to have the default date when the user is on the app
  const years = memories.map((m) => new Date(m.date).getFullYear()); //extracts the dates in the memories state and leaves out the years
  const uniqueYears = [...new Set(years)]; //makes it one year each
  const sortedYears = uniqueYears.sort((a, b) => b - a); //sorts it from highest year to lowest
  const [isExiting, setIsExiting] = useState(false); //this is to trigger the exit animation on the splash screen, we will pass this state to the splash screen and then when the user clicks on the button to enter the app, we will set this state to true and then after a delay of 1 second, we will set the showSplash state to false to hide the splash screen and show the home screen, we use a timeout to delay the hiding of the splash screen so the user can see the exit animation before it disappears
  const [splash, showSplash] = useState(true); //this is to show the splash screen when the user first opens the app, it will be true and then after 3 seconds it will be set to false and the splash screen will be hidden and the home screen will be shown, we use a timeout to delay the hiding of the splash screen so the user can see it for a few seconds before it disappears
  const [buttonIndex, setButtonIndex] = useState(0); //this is to keep track of the index of the button that is active, so we can change the style of the button when it is active, we will pass this state to the yearbar and then we will compare it with the index of the button in the yearbar and if it is the same, we will change the style of the button to show that it is active
  const [showModal, setShowModal] = useState(false); //this state is to show the modal when the user clicks on the view more button, otherwise it will be hidden, when the user clicks on the view more button, the modal will be shown and when the user clicks on the close button, the modal will be hidden again
  const [showEditForm, setEditForm] = useState(false); //this state is to show the edit form when the user clicks on the edit note button, otherwise it will be hidden and only the note will be shown, when the user clicks on edit note, the form will be shown and the note will be hidden, when the user submits the form, the note will be updated and the form will be hidden again
  const [editNote, setEditNote] = useState(true); //this state is to show the edit button only when the user clicks on it, otherwise it will be hidden and only the note will be shown, when the user clicks on edit note, the form will be shown and the note will be hidden, when the user submits the form, the note will be updated and the form will be hidden again
  const [newText, setNewText] = useState(""); //this will be used to store the new text when the user edits the note, we will pass this state to the edit form and then we will update the note in the memory card with this new text when the user submits the form
  const [errorNoteId, setErrorNoteId] = useState(null); // which card has the error
  const [activeIndex, setactiveIndex] = useState(0); //this is to show the position of the slideshow
  const [activeMedia, setactiveMedia] = useState([]);
  // this state stores the media array of the card that was clicked
  // when a user presses "View More", we take that card’s preparedMedia
  // and put it here so the modal/slideshow knows what images/videos to show
  const [editingId, setEditingId] = useState(null);
  const { user, loading } = useAuth(); //this is ti get the user from the context
  const [journalId, setJournalId] = useState(null); //this will be used to see the journal the user belongs to properly view the app
  const [journalLoading, setJournalLoading] = useState(true); //this basically makes the app wait while the journal is being checked
  const [setupLoading, setSetupLoading] = useState(false);
  // this is used when the user clicks create or join journal
  // while we are talking to Firestore (creating or checking invite code)
  // we set this to true so buttons get disabled and the user can’t spam click
  // once Firebase responds, we set it back to false

  const [setupError, setSetupError] = useState("");
  // this is used to show errors during journal setup
  // for example:
  // - invite code not found
  // - something failed when creating journal
  // we store the error message here so JournalSetup can display it on screen

  const [journalInviteCode, setJournalInviteCode] = useState("");
  //this will be used to save the code

  const [journalOwnerUid, setJournalOwnerUid] = useState(""); // this is see whos the owner of the journal, and it will fetch this from firebase and if another user joins the invite code will be hidden from them

  useEffect(() => {
    if (mode !== "auth") return;
    // only run this in real login mode (not demo)

    if (loading) return;
    // wait until Firebase finishes checking if someone is logged in

    if (!user) return;
    // if no user exists, stop immediately

    const checkUserJournal = async () => {
      try {
        const journalsCollection = collection(db, "journals");
        // this points to the main "journals" collection in Firestore

        const journalQuery = query(
          journalsCollection,
          where("memberUids", "array-contains", user.uid),
          limit(1)
        );
        // we are asking Firestore:
        // "Find a journal where this user's UID exists inside memberUids array"
        // limit(1) because option A = one journal per user

        const journalResult = await getDocs(journalQuery);
        // this actually fetches the matching journal (if one exists)

        if (!journalResult.empty) {
          setJournalId(journalResult.docs[0].id);
          // if we found one, store the journal's ID
        } else {
          setJournalId(null);
          // if nothing was found, user doesn't belong to a journal yet
        }
      } catch (error) {
        console.error("Error checking journal:", error);
        setJournalId(null);
      } finally {
        setJournalLoading(false);
        // whether we found one or not, we are done checking
      }
    };

    checkUserJournal();
  }, [mode, user, loading]);

  useEffect(() => {
    if (mode !== "auth") return;
    if (loading) return;
    if (journalLoading) return;
    if (!user) return;
    if (!journalId) return;

    const loadMemories = async () => {
      if (!journalId) return;

      // point to the correct collection
      const memoriesCollection = collection(
        db,
        "journals",
        journalId,
        "memories"
      );
      //Use db (our Firestore database)
      //Go to the “users” collection
      //Find the document whose ID equals journalId
      //Then go inside its “memories” subcollection

      // fetch documents from Firestore
      const memoriesData = await getDocs(memoriesCollection);
      // What this does is fetch the memories from the database directly

      // convert memoriesData into usable array
      const memoryArray = memoriesData.docs.map((doc) => ({
        //memoriesData.doc is every single memory document and we use that to map it
        //doc.id is basically the id of the memory document as firebase creates an unique id for each document
        ...doc.data(), //doc.data() returns the actual fields stored inside the document.
        id: doc.id, //we make an id of every single memory and since we need to edit or delete, each memories should have an id
      }));

      // update state
      setMemories(memoryArray);
    };

    loadMemories();
  }, [mode, user, loading, journalLoading, journalId]);
  {
    /*This is to get the data we need to show the cards even after a refresh */
  }
  useEffect(() => {
    // if we are not in demo mode, stop immediately
    if (mode !== "demo") return;

    const makeDefaultDemoCard = () => {
      const demoData = {
        // create a unique id for the card
        id:
          window.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,

        // today’s date in yyyy-mm-dd format
        date: new Date().toISOString().split("T")[0],

        // default demo content
        title: "Our First Memory 💕",
        mood: "😂",
        note: "Welcome to your demo journal!",
        media: [],
      };

      setMemories([demoData]);
    };

    // try to get any saved demo memories from localStorage
    const rawdata = localStorage.getItem(DEMO_KEY);

    // if there is no saved data, this means it's the first time entering demo
    if (!rawdata) {
      makeDefaultDemoCard();
      return;
    }

    // if rawdata exists, try to convert it back into an array
    try {
      const parsed = JSON.parse(rawdata);

      // if it's not an array OR it's an empty array, bring back the default demo card
      if (!Array.isArray(parsed) || parsed.length === 0) {
        makeDefaultDemoCard();
        return;
      }

      // otherwise load the saved demo cards
      setMemories(parsed);
    } catch (err) {
      console.error("Demo memories JSON error:", err);
      // if parsing fails, fall back to the default demo card
      makeDefaultDemoCard();
    }
  }, [mode]);

  console.log(localStorage.getItem("demo_memories"));
  {
    /*This is to save data when the user does something to the memories state */
  }
  useEffect(() => {
    // again, only do this in demo mode
    if (mode !== "demo") return;

    // whenever memories changes, save the updated version to localStorage
    // we convert it to a string because localStorage only accepts strings
    localStorage.setItem(DEMO_KEY, JSON.stringify(memories));
  }, [mode, memories]);

  useEffect(() => {
    if (memories.length === 0) return; //if the app has no memories, the code wont run

    // Only set once
    setActiveYear((prev) => (prev === null ? sortedYears[0] : prev));
  }, [memories]); //this sets the state to be set to the highest year only if its been created

  useEffect(() => {
    // If there are no years left, reset
    if (sortedYears.length === 0) {
      setActiveYear(null);
      setButtonIndex(0);
      return;
    }

    // If activeYear is missing (deleted) or not set yet, jump to newest year
    if (activeYear === null || !sortedYears.includes(activeYear)) {
      setActiveYear(sortedYears[0]);
      setButtonIndex(0);
    }
  }, [sortedYears, activeYear]);

  const filteredMemories = [...memories].filter((memory) => {
    const year = new Date(memory.date).getFullYear();
    return year === activeYear;
  }); //this will be used to filter the memories state by years

  {
    /*This is where the array of object regarding the card will be created. It will be on the home component */
  }
  const addMemory = async (newMemory) => {
    // if we are in demo mode, just update state normally
    // no database involved
    if (mode === "demo") {
      setMemories((prev) => [newMemory, ...prev]);
      return;
    }

    // if somehow there's no logged-in user, stop immediately
    // we can’t save to Firestore without knowing which user it belongs to
    if (!user) return;

    // if the user is logged in but hasn’t created/joined a journal yet, stop
    // because in auth mode, memories belong to a journal (shared space), not the user
    if (!journalId) return;

    // this points to:
    // journals -> journalId -> memories subcollection
    // this is where the memory will be stored (shared for both of us)
    const memoriesCollection = collection(
      db,
      "journals",
      journalId,
      "memories"
    );

    // add the new memory to Firestore
    // we also attach a createdAt timestamp from the server
    const memoryData = await addDoc(memoriesCollection, {
      ...newMemory,
      createdAt: serverTimestamp(),
    });

    // Firestore creates its own unique id for the document
    // so we take that id and merge it with our original memory object
    // we need it to match when we either edit our page or delete
    const savedMemory = {
      ...newMemory,
      id: memoryData.id,
    };

    // update local state immediately so the card appears instantly
    // no need to refresh
    setMemories((prev) => [savedMemory, ...prev]);
  };
  {
    /*this is a helper function which we will pass this function on the form and the object in the 
            created will be passed using the newMemory callback using prev will get the latest state and a new memory will be added*/
  }

  const handleButton = (button, btnIndex) => {
    setActiveYear(button);
    setButtonIndex(btnIndex);
  };
  const deleteID = async (id) => {
    if (mode === "demo") {
      setMemories((prev) => prev.filter((memory) => memory.id !== id));
      return;
    }
    // checks to see if customer is logged in or if they have a journal
    if (!user) return;
    if (!journalId) return;

    try {
      // point to the exact memory document inside the journal
      const memoryDoc = doc(db, "journals", journalId, "memories", id);

      // delete from Firestore first
      await deleteDoc(memoryDoc);

      // then remove from UI state
      setMemories((prev) => prev.filter((memory) => memory.id !== id));
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  const hideText = () => {
    setEditNote(false);
  };

  const handleNote = async (e, id, newText) => {
    e.preventDefault();
    if (!newText.trim()) {
      setErrorNoteId(id); // only this card shows error
      return;
    }

    //if the mode is set to demo
    if (mode === "demo") {
      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === id ? { ...memory, note: newText } : memory
        )
      ); //this is to update the note in the memory card when the user submits the edit form, we will map through the memories state and then we will check if the id of the memory is the same as the id of the memory that we want to edit, if it is, we will update the note with the new text and if it is not, we will return the memory as it is
      setEditingId(null);
      setNewText("");
      setErrorNoteId(null); // clear error
      return;
    }
    // ✅ AUTH: Firestore + state
    if (!user) return;
    if (!journalId) return;

    try {
      const memoryDoc = doc(db, "journals", journalId, "memories", id); //this means it will check firestore for the specific memoryid

      await updateDoc(memoryDoc, {
        note: newText, //it will only update the note and when it was updated
        updatedAt: serverTimestamp(),
      });

      // update UI after successful save
      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === id ? { ...memory, note: newText } : memory
        )
      );

      setEditingId(null);
      setNewText("");
      setErrorNoteId(null);
    } catch (error) {
      console.error("Error updating note:", error?.code, error?.message, error);
      setErrorNoteId(id);
    }
  };
  const cancelEdit = () => {
    setEditingId(null);
    setErrorNoteId(null);
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      setEditingId(null);
      setErrorNoteId(null); // clear error
      setEditNote(true);
      setNewText("");
    }
  }; //if the esc button is pressed, the edit note will stop
  const openModal = (mediaArray) => {
    // when a card is clicked, we grab that card’s media array
    // (this will already be preparedMedia, not raw File objects)

    setactiveMedia(mediaArray);
    // store all the images/videos of the clicked card
    // so the modal knows what to display in the slideshow

    setactiveIndex(0);
    // reset the slideshow to start from the first image
    // so every time you open it, it doesn’t stay on the last viewed one

    setShowModal(true);
    // finally show the modal on screen
  };

  const nextSlide = () => {
    let indexTracker = activeIndex + 1;
    if (indexTracker > activeMedia.length - 1) {
      setactiveIndex(0);
    } else {
      setactiveIndex(indexTracker);
    }

    console.log(indexTracker);
  };

  const prevSlide = () => {
    let indexTracker = activeIndex - 1;
    if (indexTracker < 0) {
      setactiveIndex(activeMedia.length - 1);
    } else {
      setactiveIndex(indexTracker);
    }
  };

  // this runs when the user clicks "Edit Note" on a card
  // we take that card’s id and store it in editingId (in Home)
  // this tells the app which specific card should show the edit form
  // only the card whose id matches editingId will open its input box
  const trackingEditID = (id) => {
    setEditingId(id);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const generateInviteCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }

    //this is used to create the unique code for the user to join the journal

    return code;
  };

  const createJournal = async () => {
    if (!user) return;

    try {
      const inviteCode = generateInviteCode();

      const journalsCollection = collection(db, "journals");

      const newJournal = await addDoc(journalsCollection, {
        inviteCode,
        memberUids: [user.uid],
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setJournalId(newJournal.id);
      setJournalInviteCode(inviteCode); //this will add the invite code that will be on the UI
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };

  const joinJournal = async (code) => {
    if (!user) return;
    // stop if nobody is logged in (we need a user uid to join)

    const cleanedCode = code.trim().toUpperCase();
    // clean the code so spaces + lowercase don’t break it

    if (!cleanedCode) {
      setSetupError("Enter an invite code");
      // if they didn’t type anything, show error and stop
      return;
    }

    setSetupError("");
    // clear old errors
    setSetupLoading(true);
    // turn loading on so buttons disable + user can’t spam click

    try {
      // 1) point to the journals collection
      const journalsCollection = collection(db, "journals");

      // 2) find ONE journal where inviteCode matches the code typed
      const journalQuery = query(
        journalsCollection,
        where("inviteCode", "==", cleanedCode),
        limit(1)
      );

      // 3) run the query and fetch results
      const journalResult = await getDocs(journalQuery);

      // 4) if nothing matches, the code is wrong
      if (journalResult.empty) {
        setSetupError("That code doesn’t match any journal");
        return;
      }

      // 5) get the journal we found and grab its Firestore doc id
      const foundJournalDoc = journalResult.docs[0];
      const foundJournalId = foundJournalDoc.id;

      // 6) point to that exact journal document
      const journalDocRef = doc(db, "journals", foundJournalId);

      // 7) add this user to the journal members list (no duplicates)
      await updateDoc(journalDocRef, {
        memberUids: arrayUnion(user.uid),
      });

      // 8) save journalId in state so the app switches into the timeline + loads memories
      setJournalId(foundJournalId);
    } catch (error) {
      console.error(
        "Error joining journal:",
        error?.code,
        error?.message,
        error
      );
      setSetupError("Could not join journal, try again");
      // if anything fails, show a simple message
    } finally {
      setSetupLoading(false);
      // always turn loading off at the end
    }
  };

  useEffect(() => {
    // only run this in real logged-in mode
    if (mode !== "auth") return;

    // wait until we finish checking the journal
    if (journalLoading) return;

    // if user has no journal yet, stop
    if (!journalId) return;

    const fetchJournalInviteCode = async () => {
      try {
        // point to the exact journal document
        const journalDocRef = doc(db, "journals", journalId);

        // fetch that journal document from Firestore
        const journalData = await getDoc(journalDocRef);

        // if the document actually exists
        if (journalData.exists()) {
          // get the actual data inside the journal document
          const journalInfo = journalData.data();

          setJournalOwnerUid(journalInfo.ownerUid || ""); //this will be added to the state, and if it matches user id, it will show the invite code

          // store the invite code into state
          // this makes it appear in the UI
          setJournalInviteCode(journalInfo.inviteCode || ""); //means if we find the journal code use it if not leave it blank, this is to stop it from crashing
        }
      } catch (error) {
        console.error("Error loading invite code:", error);
      }
    };

    // run the function
    fetchJournalInviteCode();
  }, [mode, journalLoading, journalId]);

  if (mode === "auth" && !journalLoading && !journalId) {
    return (
      <JournalSetup
        createJournal={createJournal}
        joinJournal={joinJournal}
        loading={setupLoading}
        error={setupError}
      />
    );
  }
  return (
    <div
      className="relative w-full min-h-[100dvh] pb-40"
      style={{
        backgroundImage: `
                linear-gradient(to bottom, transparent 95%, rgba(0,0,0,0.15) 95%)
                `,
        backgroundSize: "100% 32px, 100% 100%",
        backgroundColor: "#ffffff",
      }}
    >
      {showModal && (
        <Modal
          activeMedia={activeMedia}
          activeIndex={activeIndex}
          setactiveIndex={setactiveIndex}
          closeModal={() => setShowModal(false)}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
        />
      )}
      {splash && (
        <Splashscreen
          setIsExiting={setIsExiting}
          isExiting={isExiting}
          showSplash={showSplash}
        />
      )}
      <header className="relative flex flex-row justify-center items-center w-full">
        <img
          src={Logo}
          alt="Us with Time Logo"
          className="w-52 h-52 object-contain justify-center"
        />
        {mode === "auth" && (
          <button
            className="absolute top-5 lg:top-10 flex justify-center items-center right-0 lg:right-5 w-24 h-24 uppercase font-display text-black cursor-pointer"
            aria-label="click to logout"
            onClick={handleLogout}
          >
            <LogOut size={28} strokeWidth={1.5} />
          </button>
        )}
      </header>
      {sortedYears.length > 0 && (
        <section className="relative -top-10 lg:-top-10 flex flex-row justify-center w-full">
          <Yearbar
            sortedYears={sortedYears}
            setActiveYear={setActiveYear}
            handleButton={handleButton}
            buttonIndex={buttonIndex}
          />
        </section>
      )}
      {/*the memory card will be added here*/}
      <header className="flex flex-col items-center w-full px-6 lg:px-0 gap-8">
        {filteredMemories.length === 0 ? (
          <h1 className="text-xl max-w-sm weight-100 pl-4 font-display">
            Create your first memory by pressing the button on the bottom right
            corner!
          </h1>
        ) : (
          [...filteredMemories]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((memory) => {
              const isEditing = editingId === memory.id;

              return (
                <MemoryCard
                  key={memory.id}
                  {...memory}
                  deleteID={deleteID}
                  openModal={openModal}
                  showEditForm={showEditForm}
                  setEditForm={setEditForm}
                  setEditNote={() => setEditNote(false)}
                  editNote={editNote}
                  hideText={hideText}
                  newText={newText}
                  setNewText={setNewText}
                  handleNote={handleNote}
                  errorNoteId={errorNoteId}
                  handleEscape={handleEscape}
                  trackingEditID={trackingEditID}
                  editingId={editingId}
                  isEditing={isEditing}
                  cancelEdit={cancelEdit}
                />
              );
            })
        )}
      </header>

      {/*add the button to open the form*/}
      <OpenFormButton setIsOpen={setIsOpen} isOpen={isOpen} />
      {/*Here's the form to help the user create the memory card and we will pass the state through*/}
      <Form
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        addMemory={addMemory}
        mode={mode}
        journalId={journalId}
      />
      {mode === "auth" &&
        journalInviteCode &&
        user?.uid === journalOwnerUid && (
          <div className="fixed left-5 flex flex-col bottom-10 md:flex-row lg:flex-row mx-auto mt-2 w-fit flex items-center gap-3 border-2 border-black rounded-lg bg-white px-4 py-2">
            <span className="font-display text-sm">Invite code:</span>
            <span className="font-g font-bold tracking-widest">
              {journalInviteCode}
            </span>
          </div>
        )}
    </div>
  );
}