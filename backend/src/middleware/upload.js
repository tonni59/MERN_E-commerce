import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "uploads",
);
fs.mkdirSync(uploadRoot, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const fileFilter = (_req, file, cb) => {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
    return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  cb(null, true);
};
export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
}).single("image");
