import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import profile from "../assets/profile.svg";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database, db } from "../firebase/config";
import { generateChatId } from "../utils/utils";
import { MessagesList } from "./MessagesList";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";

type Props = {
  currentChat: DocumentData | null | undefined;
};

const Messages = ({ currentChat }: Props) => {
  const [user] = useAuthState(auth);
  const chatId = generateChatId(currentChat?.uid, user?.uid);
  const [data, setData] = useState<DocumentData | undefined>();
  const [text, setText] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [triggerScroll, setTriggerScroll] = useState<boolean>(false);
  const [reading, setReading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Set Reading state
  useEffect(() => {
    // Read & Set reciever status
    const starCountRef = ref(database, "readings/" + currentChat?.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      setReading(data);
    });
  }, [currentChat]);

  // Create messages document
  useEffect(() => {
    if (chatId) {
      const docRef = doc(db, "chats", chatId);
      setLoading(true);
      getDoc(docRef)
        .then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(docRef, {
              messages: [],
            }).then(() => {
              setTriggerScroll(true);
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [chatId]);

  // Get chats based on chatId
  useEffect(() => {
    if (!chatId) return;

    const docRef = query(
      collection(db, "chats"),
      where(documentId(), "==", chatId)
    );
    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setData(doc.data()?.messages);
      });
    });

    return () => unsubscribe();
  }, [chatId]);

  // Handle Send
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Return if fields are missing
    if (!currentChat || !user || !chatId) return;

    // status
    let status;
    if (reading && currentChat?.online) {
      status = "read";
    } else if (!reading && currentChat?.online) {
      status = "delivered";
    } else {
      status = "sent";
    }

    const message = {
      sender: user?.uid,
      receiver: currentChat?.uid,
      text: text,
      createdAt: Date.now(),
      status,
    };

    setSending(true);
    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion(message),
    });
    setTriggerScroll(true);
    setSending(false);

    setText("");
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full px-4 py-2 border-b flex flex-nowrap gap-2 items-center">
        <div className={`avatar ${currentChat?.online ? "online" : "offline"}`}>
          <div className="w-10 rounded-full border">
            <img
              src={currentChat?.photoURL || profile}
              alt={currentChat?.displayName || currentChat?.email}
              className="object-cover"
            />
          </div>
        </div>
        <p className="truncate">
          {currentChat?.displayName || currentChat?.email || "Messages"}
        </p>
      </div>
      {/* Messages */}
      <MessagesList
        messages={data}
        currentChat={currentChat}
        triggerScroll={triggerScroll}
        setTriggerScroll={setTriggerScroll}
        chatId={chatId}
      />

      {/* Message Input */}
      {currentChat && user ? (
        <form
          className="mt-auto p-4 flex flex-nowrap gap-2"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setText(e.target.value)
            }
          />
          <button className="btn" disabled={loading || sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      ) : null}
    </div>
  );
};

export { Messages };
