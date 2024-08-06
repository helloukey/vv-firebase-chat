import { DocumentData } from "firebase/firestore";
import profile from "../assets/profile.svg";

type Props = {
  currentChat: DocumentData | null | undefined;
};

const Messages = ({ currentChat }: Props) => {
  
  return (
    <div className="w-full">
      <div className="w-full px-4 py-2 border-b flex flex-nowrap gap-2 items-center">
          <div
            className={`avatar ${currentChat?.online ? "online" : "offline"}`}
          >
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
    </div>
  );
};

export { Messages };
