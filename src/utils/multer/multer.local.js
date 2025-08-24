import multer from "multer";
import fs from "fs";
export const fileTypes = {
  image: ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm"],
};

/*
 *   This method work as middleware, work once for each single file uploaded,
 *   so "file" argument is object of file info not array of files,
 *   //file =          {fieldname,originalname,encoding,mimetype}
 *   after this method finish it ==store file== and ==add"file"or"files"propertyTo"req"==
 *   //file or files = {fieldname,originalname,encoding,mimetype,destination,filename,path,size} || [{...}]
 *    fieldname => name of field sended from body
 *    orignalname => orignal name of sended file
 *    mimetype => type of sended file
 *    destination => path + filename
 *    filename => sended file will renamed on lacalServer as this name
 *    path => sended file will store on localServer to this path
 */
export const multer_localUpload = ({
  dest = "general",
  type = fileTypes.image,
}) => {
  const storage = multer.diskStorage({
    // destination: "uploads",
    destination: (req, file, callback) => {
      const fullDest = `uploads/${dest}/${req.user.name}_${req.user._id}`;
      if (!fs.existsSync(fullDest)) {
        fs.mkdirSync(fullDest, { recursive: true });
      }
      callback(null, fullDest); //* Will store file
    },
    filename: (req, file, callback) => {
      callback(null, `${req.user.name}_${file.originalname}`);
    },
  });

  const fileFilter = (req, file, callback) => {
    if (type.includes(file.mimetype)) {
      return callback(null, true);
    } else {
      return callback(new Error("Invalid file type", { cause: 400 }), false);
    }
  };
  return multer({
    storage,
    fileFilter,
    limits: 1024 * 1024 * 1024,
  });
};
