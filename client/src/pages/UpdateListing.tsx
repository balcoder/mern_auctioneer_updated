import { useEffect, useState } from "react";
import { app } from "../firebase.ts";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import type { SubmitEventHandler } from "react";
import type { RootState } from "../redux/store.ts";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

interface FormData {
  imageUrls: string[];
  name: string;
  description: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  regularPrice: number;
  discountPrice: number;
  offer: boolean;
  parking: boolean;
  furnished: boolean;
}

export default function CreateListing() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<FormData>({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 100,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imgUploadError, setImgUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  //fetch listing based on param id once page is loaded using useEffect
  useEffect(() => {
    // can't add async on useEffect directly so call this fn inside
    const fetchListing = async () => {
      const listingId = params.listingId; // called listingId in app.tsx
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      console.log(data);
      setFormData(data);
    };

    fetchListing();
  }, [params.listingId]);

  // store image function for google firebase
  const storeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const handleImageSubmit = () => {
    console.log(files);
    if (
      files &&
      files.length > 0 &&
      files.length + formData.imageUrls.length < 7
    ) {
      setUploading(true);
      setImgUploadError("");
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        // storeImage returns a promise with the downloadURL
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImgUploadError("");
          setUploading(false);
        })
        .catch(() => {
          setImgUploadError("Image upload failed (2mb max per image)");
        });
    } else {
      if (files === null) {
        setImgUploadError("You need at least one images per listing");
        setUploading(false);
      } else {
        setImgUploadError("You can only upload 6 images per listing");
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Use type narrowing to safely access 'checked'
    // const isCheckbox =
    //   e.target instanceof HTMLInputElement && e.target.type === "checkbox";
    // if (e.target.id === "sale" || e.target.id === "rent") {
    //   setFormData({
    //     ...formData,
    //     type: e.target.id,
    //   });
    // }
    // if (
    //   e.target.id === "parking" ||
    //   e.target.id === "furnished" ||
    //   e.target.id === "offer"
    // ) {
    //   setFormData({
    //     ...formData,
    //     [e.target.id]: isCheckbox
    //       ? (e.target as HTMLInputElement).checked
    //       : e.target.value,
    //   });
    // }
    // if (
    //   e.target.type === "number" ||
    //   e.target.type === "text" ||
    //   e.target.type === "textarea"
    // ) {
    //   setFormData({
    //     ...formData,
    //     [e.target.id]: e.target.value,
    //   });
    // }
    const { id, type, value } = e.target;

    // 1. Handle Radio / Type Toggles (sale or rent)
    if (id === "sale" || id === "rent") {
      setFormData((prev) => ({
        ...prev,
        type: id,
      }));
      return; // Exit early
    }

    // 2. Handle Checkboxes safely
    if (type === "checkbox") {
      // Create a type-safe reference to the input element
      const checkboxTarget = e.target as HTMLInputElement;

      setFormData((prev) => ({
        ...prev,
        [id]: checkboxTarget.checked,
      }));
      return;
    }

    // 3. Handle Numbers safely (convert string to number)
    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [id]: value === "" ? "" : Number(value),
      }));
      return; // Exit early
    }

    // 4. Fallback for all text, textarea, and other text-like inputs
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    // Guard clause: If there's no user, don't even try the fetch
    if (!currentUser) return;

    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      setLoading(true);
      setError("");
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }
      navigate(`/listing/${params.listingId}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }

      setLoading(false);
    }
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a Listing
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 "
      >
        <div className="flex flex-col gap-4 flex-1">
          <input
            onChange={handleChange}
            value={formData.name || ""}
            id="name"
            type="text"
            placeholder="Name"
            maxLength={62}
            minLength={10}
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />
          <textarea
            onChange={handleChange}
            value={formData.description || ""}
            placeholder="Description"
            id="description"
            name="description"
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />
          <input
            onChange={handleChange}
            value={formData.address || ""}
            id="address"
            type="text"
            placeholder="Address"
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 my-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="20"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="20"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="100"
                max="10000000"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">($/Month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="bg-white border border-gray-300 rounded-lg p-2"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">($/Month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover(max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded-lg w-full"
              type="file"
              id="images"
              accept="images/*"
              multiple
            />
            <button
              onClick={handleImageSubmit}
              type="button"
              disabled={uploading}
              className="p-3 border border-green-700 text-green-700 uppercase rounded hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm self-center">
            {imgUploadError && imgUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border border-gray-300 items-center gap-4"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-700 uppercase p-3"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="rounded-lg bg-slate-700 text-white p-3 uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
