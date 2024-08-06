// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQDwztLYzwG74Y1HWVhZXJ-Pw-qI-UeEY",
  authDomain: "vv-firebase-chat.firebaseapp.com",
  projectId: "vv-firebase-chat",
  storageBucket: "vv-firebase-chat.appspot.com",
  messagingSenderId: "152816903347",
  appId: "1:152816903347:web:a67f60dc1394d827c83cc6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// firebase services init
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage();
const timestamp = serverTimestamp();

export { db, auth, storage, timestamp };
