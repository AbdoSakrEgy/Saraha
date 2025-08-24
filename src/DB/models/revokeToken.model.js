import { model, Schema, Types } from "mongoose";

const schema = new Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiredIn: {
      type: Date,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const revokeTokenModel = new model("revokeTokens", schema);

export default revokeTokenModel;
