import nodemailer from "nodemailer";
import "dotenv/config";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `sarahaApp"<${process.env.user}>"`,
      to,
      subject,
      html,
    });

    const ok = Array.isArray(info?.accepted) && info.accepted.length > 0;
    return { ok, info };
  } catch (error) {
    return { ok: false, error };
  }
};
