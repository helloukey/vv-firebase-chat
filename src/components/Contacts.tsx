import { DocumentData } from "firebase/firestore";
import profile from "../assets/profile.svg";
import { Link } from "react-router-dom";

type Props = {
  contacts: DocumentData[] | undefined;
};

const Contacts = ({ contacts }: Props) => {

  return (
    <div className="w-full max-w-sm border-r">
      <h1 className="p-4 bg-primary text-white font-semibold">Contacts</h1>
      {contacts
        ? contacts.map((contact) => (
            <Link
              to={`/chats?id=${contact.uid}`}
              key={contact.uid}
              className="p-4 border-b flex flex-nowrap gap-2 items-center hover:bg-gray-100"
            >
              <div
                className={`avatar ${contact.online ? "online" : "offline"}`}
              >
                <div className="w-10 rounded-full border">
                  <img
                    src={contact?.photoURL || profile}
                    alt={contact?.displayName || contact.email}
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="truncate">
                {contact?.displayName || contact.email}
              </p>
            </Link>
          ))
        : null}
    </div>
  );
};

export { Contacts };
