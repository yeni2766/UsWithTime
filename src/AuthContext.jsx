import { createContext, useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; //this is used to see if the user logs in or out
import { auth } from "./firebase";

const AuthContext = createContext(null); //create context is used to create an empty container which if data is added inside it can be shared everyone on the app, we need this for the login
//if theres no data its set to default which is null

export const useAuth = () => useContext(AuthContext);

//useAuth() = a shortcut to get that logged-in user inside any component. I used export so it can be imported

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); //this will store the user object
  const [loading, setLoading] = useState(true); //Loading starts as true because it is still waiting for Firebase to tell us if someone is logged in.

  useEffect(() => {
    // this runs once when the app loads
    // we are telling Firebase to listen to the authentication state

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // currentUser will either be:
      // - a user object if someone is logged in
      // - null if nobody is logged in
      //This is set when the user logs in and signinwithemailandpassword() is used

      setUser(currentUser);
      // store the real Firebase user inside our global context

      setLoading(false);
      // once Firebase responds, we stop loading
      // now we officially know if someone is logged in or not
    });

    return () => unsubscribe();
    // this cleans up the listener if the component ever unmounts
    // basically we stop listening to Firebase when we don’t need to anymore
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* 
      .Provider is what actually puts the data inside the context "box".
      We are passing user and loading so the whole app can access them.
      
      user = the Firebase user object if someone is logged in,
             or null if nobody is logged in.

      loading = true while Firebase is still checking if someone is logged in.
                This prevents the app from making wrong assumptions on refresh.
    */}
      {children}
    </AuthContext.Provider>
  );
}