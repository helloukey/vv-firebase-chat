import { Link, redirect } from "react-router-dom";
import profile from "../assets/profile.svg";
import { useSignOut, useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { getDatabase, ref, set } from "firebase/database";

type Props = {};

const Navbar = (props: Props) => {
  const [signOut, loading, error] = useSignOut(auth);
  const [user] = useAuthState(auth);
  const database = getDatabase();

  // Handle logout
  const handleLogout = async () => {
    // Set user online status
    if (user) {
      const myConnectionsRef = ref(database, `/users/${user?.uid}`);
      await set(myConnectionsRef, false);
    }
    const success = await signOut();
    if (success) {
      return redirect("/");
    }
  };

  if (error) {
    alert("Unable to logout! Please try again.");
  }

  return (
    <div className="navbar bg-base-100 shadow-md sm:px-8">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Chat App
        </Link>
      </div>
      {user ? (
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <button className="btn btn-circle p-1" disabled={loading}>
                <img
                  alt="User"
                  src={user?.photoURL ? user.photoURL : profile}
                  height={24}
                  width={24}
                  className="rounded-full"
                />
              </button>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/chats">Chats</Link>
              </li>
              <li>
                <button onClick={handleLogout} disabled={loading}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { Navbar };
