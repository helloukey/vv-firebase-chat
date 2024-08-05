import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Authentication } from "./components/Authentication";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/config";
import { Error } from "./components/Error";
import { Chats } from "./components/Chats";

function App() {
  const [user, loading, error] = useAuthState(auth);

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
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
