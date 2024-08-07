import { useState } from "react";
import { auth, db } from "../firebase/config";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { doc, setDoc } from "firebase/firestore";
import { Error } from "./Error";
import { getDatabase, ref, set } from "firebase/database";

type Props = {};

const Authentication = (props: Props) => {
  const [screen, setScreen] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const [signInWithEmailAndPassword, loginUser, loginLoading, loginError] =
    useSignInWithEmailAndPassword(auth);
  const database = getDatabase();

  // Handle Screen Switch
  const handleScreenSwitch = () => {
    if (screen === "login") {
      setScreen("register");
    } else {
      setScreen("login");
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (screen === "register") {
      const response = await createUserWithEmailAndPassword(email, password);
      if (response) {
        await setDoc(doc(db, "users", response.user.uid), {
          displayName: "",
          email: response.user.email,
          photoURL: "",
        });
        // Set user online status
        const myConnectionsRef = ref(database, `/users/${response.user.uid}`);
        set(myConnectionsRef, true);
      }
    } else {
      const response = await signInWithEmailAndPassword(email, password);
      if (response) {
        // Set user online status
        const myConnectionsRef = ref(database, `/users/${response.user.uid}`);
        set(myConnectionsRef, true);
      }
    }

    console.log(user, loginUser);
  };

  return (
    <div className="w-full my-20">
      <h1 className="text-center font-bold text-2xl my-4">
        {screen === "login" ? "Login" : "Register"}
      </h1>
      <div className="hero">
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          {/* Form */}
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              <div className="label">
                <button
                  className="label-text-alt link link-hover"
                  onClick={handleScreenSwitch}
                  type="button"
                >
                  {screen === "login"
                    ? "Don't have an account? Register Here"
                    : "Already have an account? Login Here"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? <Error message={error?.message} /> : null}
            {loginError ? <Error message={loginError?.message} /> : null}

            <div className="form-control mt-6">
              <button
                className="btn btn-primary"
                disabled={loading || loginLoading}
              >
                {screen === "login" ? "Login" : "Register"}
                {loading || loginLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : null}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { Authentication };
