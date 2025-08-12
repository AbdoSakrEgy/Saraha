import multer from "multer";
import fs from "fs";
import path from "path";

export const uploadFile = () => {
  const storage = multer.diskStorage({
    // destination: "uploads",
    destination: (req, file, callback) => {
      const dest = `uploads/${req.user._id}_${req.user.name}`;
      const fullDest = path.resolve(".", dest);
      req.dest = dest;
      if (!fs.existsSync(fullDest)) {
        fs.mkdirSync(fullDest, { recursive: true });
      }
      callback(null, fullDest);
    },
    filename: (req, file, callback) => {
      const name = req.user.name + "_" + file.originalname;
      callback(null, name);
    },
  });

  return multer({
    storage,
  });
};
