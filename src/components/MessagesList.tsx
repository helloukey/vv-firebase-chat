import { DocumentData } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useEffect, useRef } from "react";

type Props = {
  messages: DocumentData | undefined;
  currentChat: DocumentData | null | undefined;
  triggerScroll: boolean;
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
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
}: Props) => {
  const scrollView = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  useEffect(() => {
    if (triggerScroll && scrollView) {
      scrollView.current?.scrollIntoView({behavior: "smooth"});
      setTriggerScroll(false);
    }
  }, [triggerScroll, setTriggerScroll]);

  return (
    <div className="p-4 w-full overflow-auto">
      <div className="w-full p-4 flex flex-col last:mb-16">
        {messages && messages.length
          ? messages[0].messages.map((message: Message) => (
              <div className="mb-2" key={message.createdAt}>
                <div
                  className={`chat ${
                    currentChat?.uid === message.sender
                      ? "chat-start"
                      : "chat-end"
                  }`}
                >
                  <div
                    className={`chat-bubble ${
                      currentChat?.uid === message.sender
                        ? ""
                        : "chat-bubble-accent"
                    }`}
                  >
                    {message.text}
                  </div>
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
