import {
  collection,
  DocumentData,
  documentId,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { Contacts } from "./Contacts";
import { Messages } from "./Messages";
import { Error } from "./Error";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDatabase, ref } from "firebase/database";
import { useList } from "react-firebase-hooks/database";

type Props = {};

const Chats = (props: Props) => {
  const [user] = useAuthState(auth);
  const [data, setData] = useState<DocumentData[] | undefined>();
  const [value, loading, error] = useCollection(
    query(collection(db, "users"), where(documentId(), "!=", user?.uid))
  );
  const [params] = useSearchParams();
  const id = params.get("id");
  const [currentChat, setCurrentChat] = useState<DocumentData | undefined>();
  const database = getDatabase();
  const [snapshots] = useList(ref(database, "users"));
  const [updatedContacts, setUpdatedContacts] = useState<
    DocumentData[] | undefined
  >(data);

  // Update Data
  useEffect(() => {
    if (value) {
      const result = value.docs.map((doc) => {
        return { uid: doc.id, ...doc.data() };
      });
      setData(result);
    }
  }, [value]);

  // Add online status based on snapshot
  useEffect(() => {
    if (snapshots && data) {
      const newContacts = data?.map((contact: DocumentData) => {
        const snapshot = snapshots.find((snap) => snap.key === contact.uid);
        return {
          ...contact,
          online: snapshot ? snapshot.val() : false,
        };
      });
      setUpdatedContacts(newContacts);
    }
  }, [data, snapshots]);

  // Current Chat
  useEffect(() => {
    const result = updatedContacts?.filter((d) => d.uid === id)[0];
    setCurrentChat(result);
  }, [id, updatedContacts]);

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
    <div className="w-full mb-20 mt-16 border shadow-sm h-[65vh]">
      <div className="w-full h-full mx-auto flex flex-row border border-base-300">
        <Contacts contacts={updatedContacts} />
        <Messages currentChat={currentChat} />
      </div>
    </div>
  );
};

export { Chats };
