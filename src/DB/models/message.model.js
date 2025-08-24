import { model, Schema, Types } from "mongoose";

const imageSchema = new Schema(
  {
    secure_url: String,
    public_id: String,
  },
  { _id: false }
);
const schema = new Schema(
  {
    body: {
      type: String,
      required: function () {
        if (this.images.length > 0) {
          return false;
        } else {
          return true;
        }
      },
    },
    images: [imageSchema],
    from: {
      type: Types.ObjectId,
      ref: "users",
    },
    to: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const messageModel = model("messages", schema);

export default messageModel;
