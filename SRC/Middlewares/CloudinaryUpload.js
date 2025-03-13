import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Utils/ImageUpload.js";

// 🔹 Configure Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ticketa_uploads", // Change this to your preferred folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

export default upload;
