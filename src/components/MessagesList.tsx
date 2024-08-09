import { doc, DocumentData, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/config";
import { useInView } from "react-intersection-observer";
import { getDatabase, onValue, ref, set } from "firebase/database";

type Props = {
  messages: DocumentData | undefined;
  currentChat: DocumentData | null | undefined;
  triggerScroll: boolean;
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
  chatId: string;
};

type Message = {
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
  status: string;
};

const MessagesList = ({
  messages,
  currentChat,
  triggerScroll,
  setTriggerScroll,
  chatId,
}: Props) => {
  const [user] = useAuthState(auth);
  const scrollView = useRef<HTMLDivElement | null>(null);
  const { ref: listen, inView } = useInView();
  const database = getDatabase();
  const [reading, setReading] = useState<boolean>(false);

  // Scroll to bottom
  useEffect(() => {
    if (triggerScroll && scrollView) {
      scrollView.current?.scrollIntoView({ behavior: "smooth" });
      setTriggerScroll(false);
    }
  }, [triggerScroll, setTriggerScroll]);

  // Add inView to realtime database
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const myConnectionsRef = ref(db, `/readings/${user?.uid}`);

      set(myConnectionsRef, inView);
    }
  }, [inView, user]);

  // Set Reading state
  useEffect(() => {
    // Read & Set reciever status
    const connectionRef = ref(database, "/readings/" + currentChat?.uid);
    onValue(connectionRef, (snapshot) => {
      const data = snapshot.val();
      setReading(data);
    });
  }, [database, currentChat]);

  // Update messages as read for views
  useEffect(() => {
    if (currentChat && messages && messages.length && chatId) {
      const updatedMessages = messages.map((message: DocumentData) => {
        if (
          reading &&
          currentChat.online &&
          message.receiver === currentChat.uid &&
          (message.status === "sent" || message.status === "delivered")
        ) {
          return { ...message, status: "read" };
        } else if (
          !reading &&
          currentChat.online &&
          message.receiver === currentChat.uid &&
          message.status === "sent" &&
          message.status !== "read"
        ) {
          return { ...message, status: "delivered" };
        } else {
          return message;
        }
      });

      const update = async () => {
        await updateDoc(doc(db, "chats", chatId), {
          messages: updatedMessages,
        });
      };

      update();
    }
  }, [currentChat, messages, chatId, reading]);

  return (
    <div className="p-4 w-full overflow-auto">
      <div className="w-full p-4 flex flex-col last:mb-16">
        {messages && messages.length
          ? messages.map((message: Message) => (
              <div className="mb-2" key={message.createdAt}>
                <div
                  className={`chat ${
                    message.sender === currentChat?.uid
                      ? "chat-start"
                      : "chat-end"
                  }`}
                  ref={listen}
                >
                  <div
                    className={`chat-bubble ${
                      message.sender === currentChat?.uid
                        ? ""
                        : "chat-bubble-accent"
                    }`}
                  >
                    {message.text}
                  </div>
                  {/* Status */}
                  {message.sender === user?.uid ? (
                    <div className="chat-footer opacity-50">
                      {message.status}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          : null}
        <div ref={scrollView} className="h-4 w-full"></div>
      </div>
    </div>
  );
};

export { MessagesList };
