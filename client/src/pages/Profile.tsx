import type { JSX } from "react";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import type { RootState } from "../redux/store.ts";
import type { SubmitEventHandler } from "react";
import type { UserState } from "../redux/user/userSlice.ts";

interface ProfileFormData {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

interface UserListing {
  _id: string;
  name: string;
  description: string;
  address: string;
  regularPrice: number;
  discountPrice: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  type: "rent" | "sale";
  offer: boolean;
  imageUrls: string[];
  userRef: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Profile(): JSX.Element {
  const { currentUser, loading, error } = useSelector(
    (state: RootState) => state.user as UserState,
  );
  // If for some bizarre reason the user is missing, don't render the rest
  // if (!currentUser) return <div>Loading...</div>;

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [showListingError, setShowListingError] = useState(false);
  const [showDeleteListingError, setShowDeleteListingError] = useState(false);
  const dispatch = useDispatch();

  // firebase storage rules
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 *1024 &&
  // request.resource.contentType.matches('image/.*')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteUser = async () => {
    // 1. Guard clause: If there's no user, don't even try the fetch
    if (!currentUser) return;

    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(deleteUserFailure(error.message));
      } else {
        dispatch(
          deleteUserFailure("An unknown error occured during delete user"),
        );
      }
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(signOutUserFailure(error.message));
      } else {
        dispatch(signOutUserFailure("An unknown error occured during signout"));
      }
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    // Guard clause: If there's no user, don't even try the fetch
    if (!currentUser) return;
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setUpdateSuccess(false);
        dispatch(updateUserFailure(data.message));
        return;
      }
      setUpdateSuccess(true);
      dispatch(updateUserSuccess(data));
    } catch (error) {
      setUpdateSuccess(false);
      if (error instanceof Error) {
        dispatch(updateUserFailure(error.message));
      } else {
        dispatch(
          updateUserFailure("An unknown error occured during update user"),
        );
      }
    }
  };

  const handleShowListings = async () => {
    if (!currentUser) return;
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setShowListingError(true);
      }
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      setShowDeleteListingError(false);
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        setShowDeleteListingError(true);
        return;
      }
      // successful delete so update listings
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setShowDeleteListingError(true);
      }
    }
  };

  useEffect(() => {
    const handleFileUpload = (file: File) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.round(progress));
        },
        (error) => {
          console.log("Firebase Upload Error:", error);
          setFileUploadError(true);
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData((prev) => ({ ...prev, avatar: downloadURL }));
          });
        },
      );
    };

    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current?.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar || currentUser?.avatar}
          alt="profile"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload(image must be less than 2MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}`}</span>
          ) : filePerc === 100 ? (
            <span>Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <input
          id="username"
          type="text"
          placeholder="username"
          defaultValue={currentUser?.username}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          id="email"
          type="text"
          placeholder="email"
          defaultValue={currentUser?.email}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          id="password"
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className=" bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-70 shadow-lg active:shadow-none active:translate-y-1 transition-all"
        >
          {loading ? "Loading" : "Update"}
        </button>
        <Link
          className="bg-green-800 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-70 shadow-lg active:shadow-none active:translate-y-1 transition-all text-center"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>
      <div className="text-red-700 mt-5">{error ? error : ""}</div>
      <div className="text-green-700">
        {updateSuccess ? " User updated successfully" : ""}
      </div>
      <button
        onClick={handleShowListings}
        className="text-green-700 w-full cursor-pointer mb-4"
      >
        Show Listings
      </button>
      <p>{showListingError ? "Error showing listings" : ""}</p>
      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold">
          Your Listings
        </h1>
        <p>{showDeleteListingError ? "Error deleting listing" : ""}</p>
        {userListings &&
          userListings.length > 0 &&
          userListings.map((listing) => (
            <div
              className="flex justify-between items-center border border-slate-300 rounded-lg p-3 gap-4"
              key={listing._id}
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  className="h-16 w-16 object-contain "
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                />
              </Link>
              <Link
                className=" flex-1 text-slate-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col">
                <button
                  onClick={() => handleDeleteListing(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
