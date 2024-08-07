import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Authentication } from "./components/Authentication";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/config";
import { Error } from "./components/Error";
import { Chats } from "./components/Chats";
import { Profile } from "./components/Profile";
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
} from "firebase/database";
import { useEffect } from "react";

function App() {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const myConnectionsRef = ref(db, `/users/${user?.uid}`);

      const connectedRef = ref(db, ".info/connected");
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
          set(myConnectionsRef, true);
          // When I disconnect, update the last time I was seen online
          onDisconnect(myConnectionsRef).set(false);
        } else {
          set(myConnectionsRef, false);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const db = getDatabase();
      const myConnectionsRef = ref(db, `/users/${user?.uid}`);

      if (document.visibilityState === "hidden") {
        set(myConnectionsRef, false);
      } else {
        set(myConnectionsRef, true);
      }
    };

    if (user) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  // Loading screen
  if (loading) {
    return (
      <div className="my-20 mx-auto text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="my-20 w-full max-w-lg mx-auto text-center">
        <Error message={error.message} />
        <button className="btn mt-8" onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BrowserRouter>
        <Navbar />
        {/* Pages */}
        <div className="px-4 sm:px-8 md:px-16">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/chats" /> : <Authentication />}
            />
            <Route
              path="/chats"
              element={user ? <Chats /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
