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
    // Error ===================================
    /*
      Restarting 'index.js'
      DB server connected successfully.
      Backend server is running.
      Error: self-signed certificate in certificate chain
          at TLSSocket.onConnectSecure (node:_tls_wrap:1674:34)
          at TLSSocket.emit (node:events:519:28)
          at TLSSocket._finishInit (node:_tls_wrap:1085:8)
          at ssl.onhandshakedone (node:_tls_wrap:871:12) {
        code: 'ESOCKET',
        command: 'CONN'
      }
    */
    //  Bad solution ===================================
    tls: {
      rejectUnauthorized: false,
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
