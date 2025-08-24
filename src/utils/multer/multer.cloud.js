import multer from "multer";
import { fileTypes } from "./multer.local.js";

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
export const multer_cloudUpload = ({ type = fileTypes.image }) => {
  const storage = multer.diskStorage({}); //* Will store file temporarily

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
  });
};
