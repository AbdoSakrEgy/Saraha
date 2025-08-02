import mongoose from "mongoose";

export const DBconnection = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("DB server connected successfully.");
  } catch (err) {
    console.log("Unable to connect database");
  }
};
