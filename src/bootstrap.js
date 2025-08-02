import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import { DBconnection } from "./DB/connection.js";
import cors from "cors";

const bootstrap = async (express, app) => {
  await DBconnection();

  app.use(cors());
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.use((err, req, res, next) => {
    res
      .status(500)
      .json({ errMsg: err.message, status: 500, stack: err.stack });
  });

  app.listen(process.env.PORT, () => {
    console.log("Backend server is running.");
    console.log(
      "==========================================================================="
    );
  });
};
export default bootstrap;
