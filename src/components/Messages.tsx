import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  documentId,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import profile from "../assets/profile.svg";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database, db } from "../firebase/config";
import { generateChatId } from "../utils/utils";
import { useCollection } from "react-firebase-hooks/firestore";
import { MessagesList } from "./MessagesList";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";

type Props = {
  currentChat: DocumentData | null | undefined;
};

const Messages = ({ currentChat }: Props) => {
  const [user] = useAuthState(auth);
  const chatId = generateChatId(currentChat?.uid || "", user?.uid || "");
  const [value, loading] = useCollection(
    query(collection(db, "chats"), where(documentId(), "==", chatId))
  );
  const [text, setText] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [triggerScroll, setTriggerScroll] = useState<boolean>(false);
  const [reading, setReading] = useState<boolean>(false);

  // Handle Send
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Return if fields are missing
    if (!currentChat || !user) return;

    const message = {
      sender: user?.uid,
      receiver: currentChat?.uid,
      text: text,
      createdAt: Date.now(),
      status: (reading && currentChat?.online) ? "read" : currentChat.online ? "delivered" : "sent",
    };

    setSending(true);
    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion(message),
    });
    setTriggerScroll(true);
    setSending(false);

    setText("");
  };

  // Create messages document
  useEffect(() => {
    const result = value?.docs.map((doc) => doc.data());
    if (result && result.length === 0 && user && currentChat?.uid) {
      setDoc(doc(db, "chats", chatId), {
        messages: [],
      }).then(() => {
        setTriggerScroll(true);
      });
    }
  }, [chatId, value, user, currentChat]);

  // Set Reading state
  useEffect(() => {
    // Read & Set reciever status
    const starCountRef = ref(database, "readings/" + currentChat?.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      setReading(data);
    });
  }, [currentChat]);

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
        messages={value?.docs.map((doc) => doc.data())}
        currentChat={currentChat}
        triggerScroll={triggerScroll}
        setTriggerScroll={setTriggerScroll}
        chatId={chatId}
      />

      {/* Message Input */}
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
    </div>
  );
};

export { Messages };
