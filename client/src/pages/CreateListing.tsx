import { useState } from "react";
import { app } from "../firebase.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({ imageUrls: [] });
  console.log(formData);
  const [imgUploadError, setImgUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const storeImage = async (file) => {
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
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
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
          setImgUploadError(false);
          setUploading(false);
        })
        .catch((error) => {
          setImgUploadError("Image upload failed (2mb max per image)");
        });
    } else {
      setImgUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const hadnleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4 ">
        <div className="flex flex-col gap-4 flex-1">
          <input
            id="name"
            type="text"
            placeholder="Name"
            maxLength={62}
            minLength={10}
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />
          <textarea
            placeholder="description"
            type="text"
            id="description"
            name="description"
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />
          <input
            id="address"
            type="text"
            placeholder="address"
            required
            className="bg-white p-3 rounded-lg border border-slate-300"
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 my-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedroom"
                min="1"
                max="2"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="2"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="2"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">($/Month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="2"
                required
                className="bg-white border border-gray-300 rounded-lg p-2"
              />
              <div className="flex flex-col items-center">
                <p>Discounted Price</p>
                <span className="text-xs">($/Month)</span>
              </div>
            </div>
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
                  onClick={() => hadnleRemoveImage(index)}
                  className="text-red-700 uppercase p-3"
                >
                  Delete
                </button>
              </div>
            ))}
          <button className="rounded-lg bg-slate-700 text-white p-3 uppercase hover:opacity-95 disabled:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
