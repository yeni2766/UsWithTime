import { getFirestore } from "firebase/firestore"; //this is to save our data to the cloud
import { initializeApp } from "firebase/app"; //these are functions
// to hide the long complex code so it does it for us - 
// In this case initializeApp connects our app to firebase
import { getAuth } from "firebase/auth"; //This function helps in terms of getting authentication that firebase presents
import { getStorage } from "firebase/storage"; //this function will help us store photos/videos
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

//This tells firebase that this project belongs to our web app

const app = initializeApp(firebaseConfig); //we use this to connect react app to firebase
const storage = getStorage(app); //storage will be the instance of the function
const auth = getAuth(app); 
//getAuth(app) returns an object that contains all the authentication tools for that specific Firebase app.
const db = getFirestore(app);

export { auth,db,storage };
//auth is basically the result of the object that getauth creates, getting all the things firebase can do regarding authentication

