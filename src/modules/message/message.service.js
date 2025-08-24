import { create, findOne } from "../../DB/DBservices.js";
import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import { uploadManyFiles } from "../../utils/multer/cloudinary.services.js";
import { successHandler } from "../../utils/success.handler.js";

// sendMessage
export const sendMessage = async (req, res, next) => {
  const { from, to, body } = req.body;

  let sender;
  if (from) {
    sender = await findOne(userModel, { _id: from });
    if (!sender) {
      successHandler({ res, status: 404, message: "sender not found" });
    }
  }

  let reciever;
  reciever = await findOne(userModel, { _id: to });

  let images = [];
  if (req.files?.length > 0) {
    const paths = [];
    for (const file of req.files) {
      paths.push(file.path);
    }
    images = await uploadManyFiles({
      fileLocation: paths,
      storagePathOnCloudinary: `messages/${reciever._id}`,
    });
  }
  const message = await create(messageModel, { from, to, body, images });

  return successHandler({ res, status: 201, data: message });
};

// getUserMessages
export const getUserMessages = async (req, res, next) => {
  const userId = req.params.id;
  console.log(userId);
  const user = await findOne(userModel, { _id: userId }, [
    {
      path: "messages",
      select: "body images from -to",
      populate: [
        {
          path: "from",
          select: "name email phone",
        },
      ],
    },
  ]);
  successHandler({ res, data: user });
};
