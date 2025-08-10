import nodemailer from "nodemailer";
import "dotenv/config";
import { customAlphabet } from "nanoid";
const otp = customAlphabet("012345670", 6)();

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  const main = async () => {
    const info = await transporter.sendMail({
      from: `sarahaApp"<${process.env.user}>"`,
      to,
      subject,
      html,
    });
  };
  main().catch((err) => {
    console.log(err);
  });
};
