import { useAuthState, useUpdateProfile } from "react-firebase-hooks/auth";
import { useUploadFile } from "react-firebase-hooks/storage";
import { auth, storage } from "../firebase/config";
import profile from "../assets/profile.svg";
import { useState } from "react";
import { Error } from "./Error";
import { ref, getDownloadURL } from "firebase/storage";
import { redirect } from "react-router-dom";

type Props = {};
type User = {
  displayName?: string;
  photoURL?: string;
};

const Profile = (props: Props) => {
  const [user] = useAuthState(auth);
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | null | undefined>(null);
  const [inputError, setInputError] = useState<string>("");
  const [uploadFile, uploading, , error] = useUploadFile();
  const [updateProfile, updating, updateProfileError] = useUpdateProfile(auth);

  // Handle Save
  const handleSave = async () => {
    // Reset Error
    setInputError("");

    // Return if both value are empty
    if (!name && !image) {
      return;
    }

    // No Image Selected
    if (image && !image.type.includes("image")) {
      setInputError("Please select an image.");
      return;
    }

    // Image Size Limit
    if (image && Math.round(image.size / 1024) > 100) {
      setInputError("Image size should be less than 100Kb.");
      return;
    }

    // Check for user
    if (!user) {
      setInputError(
        "User not available. Try reloading the page or login again."
      );
    }

    // Upload the image
    const path = `thumbnails/${user?.uid}/${image?.name}`;
    const storageRef = ref(storage, path);
    let downloadURL = "";
    if (image) {
      await uploadFile(storageRef, image);
      downloadURL = await getDownloadURL(storageRef);
    }

    // Update Profile
    const obj: User = {};
    if (name) {
      obj["displayName"] = name;
    }
    if (downloadURL) {
      obj["photoURL"] = downloadURL;
    }

    const success = await updateProfile(obj);
    if (success) {
      setName("");
      setImage(null);
      return redirect("/profile");
    }
  };

  return (
    <div className="w-full my-8 sm:my-20 mx-auto max-w-lg">
      <img
        src={user && user.photoURL ? user.photoURL : profile}
        alt="user"
        className="w-24 h-24 rounded-full shadow-md mx-auto p-1 object-cover"
      />
      <div className="card-body px-0">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered"
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            maxLength={20}
            defaultValue={user?.displayName ? user.displayName : name}
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Profile Picture</span>
          </div>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
            accept=".jpg, .jpeg, .png"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setImage(e.target.files?.[0])
            }
          />
        </div>
        {/* Error */}
        {inputError ? (
          <div className="my-2">
            <Error message={inputError} />
          </div>
        ) : null}
        {error ? (
          <div className="my-2">
            <Error message={error.message} />
          </div>
        ) : null}
        {updateProfileError ? (
          <div className="my-2">
            <Error message={updateProfileError.message} />
          </div>
        ) : null}

        <div className="form-control items-end mt-4" onClick={handleSave}>
          <button className="btn px-8" disabled={uploading || updating}>
            {uploading || updating ? "Saving..." : "Save"}
            {uploading || updating ? (
              <span className="loading loading-spinner"></span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export { Profile };
