import { create, findOne, findOneAndUpdate } from "../../DB/DBservices.js";
import userModel, { Providers } from "../../DB/models/user.model.js";
import { decodeToken, tokenTypes } from "../../utils/decodeToken.js";
import { compare } from "../../utils/bcrypt.js";
import { successHandler } from "../../utils/success.handler.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail/sendEmail.js";
import { template } from "../../utils/sendEmail/generateHTML.js";
import { createOtp } from "../../utils/otp.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();
import { nanoid } from "nanoid";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";

// register
export const register = async (req, res, next) => {
  const { name, email, password, age, role, gender, phone } = req.body;
  const isUserExist = await findOne(userModel, { email }); // {}||null
  if (!isUserExist) {
    const otp = createOtp();
    // Send email
    const html = template(otp, name, "Confirm email");
    const { ok, info, error } = await sendEmail({
      to: email,
      subject: "sarahaApp",
      html,
    });
    if (ok) {
      const user = await create(userModel, {
        name,
        email,
        password,
        age,
        role,
        gender,
        phone,
        emailOtp: {
          otp,
          expiredIn: Date.now() + 120 * 1000,
        },
      });
      const payload = {
        id: user._id,
        email: user.email,
      };
      const jwtid = nanoid();
      const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
        expiresIn: "1 h",
        jwtid,
      });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
        expiresIn: "7 d",
        jwtid,
      });
      successHandler({
        res,
        status: 201,
        message: "User created successfully",
        data: { accessToken, refreshToken },
      });
    } else {
      successHandler({
        res,
        status: 400,
        message: "Error while checking email",
        data: error,
      });
    }
  } else {
    successHandler({
      res,
      status: 401,
      message: "User already exist",
      data: user,
    });
  }
};

// login
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne(userModel, { email }); // {}||null
  if (user && compare(password, user.password)) {
    if (user.isActive) {
      if (user.provider == Providers.system) {
        const payload = {
          id: user._id,
          email: user.email,
        };
        const jwtid = nanoid();
        const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
          expiresIn: `1 h`,
          jwtid,
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
          expiresIn: "7 d",
          jwtid,
        });
        successHandler({
          res,
          status: 202,
          data: { accessToken, refreshToken },
        });
      } else {
        successHandler({
          res,
          status: 401,
          message: "Social account login",
        });
      }
    } else {
      successHandler({ res, status: 400, message: "This account is deleted" });
    }
  } else {
    successHandler({ res, status: 401, message: "Invalid credentials" });
  }
};

// ! Miss understand the logic of this method
// social login
export const socialLogin = async (req, res, next) => {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.audience,
  });
  const { email, name } = ticket.getPayload();
  let user = await findOne(userModel, { email });
  if (!user) {
    if (user.isActive) {
      if (user.provider == Providers.google) {
        user = await create(userModel, {
          name,
          email,
          emailConfirmed: true,
          provider: Providers.google,
        });
        const payload = {
          id: user._id,
          email: user.email,
        };
        const jwtid = nanoid();
        const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
          expiresIn: "1 h",
          jwtid,
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
          expiresIn: "7 d",
          jwtid,
        });
        successHandler({
          res,
          status: 201,
          data: { accessToken, refreshToken },
        });
      } else {
        successHandler({
          res,
          status: 401,
          message: "User system login",
        });
      }
    } else {
      successHandler({ res, status: 400, message: "This account is deleted" });
    }
  } else {
    successHandler({ res, status: 400, message: "User already exist" });
  }
};

// refresh token
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const { user, payload } = await decodeToken(
    authorization,
    tokenTypes.refresh,
    next
  );
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_SEGNATURE,
    { expiresIn: "1 h", jwtid: payload.jti }
  );
  successHandler({ res, data: { accessToken } });
};

// TODO:1 Implement a verfication code for email confirmation
// TODO:2 Expired after 2 minutes
// TODO:3 Allow maximum of 5 failed attempts to use the code
// TODO:4 After 5 failed attempts, user banned for 5 minutes for requesting a new code
// TODO:5 Reset the failed attemtps count after 5 minutes
// confirm email
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await findOne(userModel, { email });
  if (user) {
    if (
      !user.sendOtpAttempts.bannedAt ||
      user.sendOtpAttempts.bannedAt + 350 * 1000 < Date.now()
    ) {
      if (compare(otp, user.emailOtp.otp)) {
        if (Date.now() <= user.emailOtp.expiredIn) {
          await findOneAndUpdate(
            userModel,
            { email },
            { emailConfirmed: true }
          );
          successHandler({ res });
        } else {
          successHandler({ res, status: 401, message: "Expired otp" });
        }
      } else {
        if (user.sendOtpAttempts.attempts < 4) {
          await findOneAndUpdate(
            userModel,
            { email },
            {
              $set: {
                "sendOtpAttempts.attempts": user.sendOtpAttempts.attempts + 1,
              },
            }
          );
        } else {
          await findOneAndUpdate(
            userModel,
            { email },
            {
              sendOtpAttempts: {
                attempts: 0,
                bannedAt: Date.now(),
              },
            }
          );
        }
        successHandler({ res, status: 401, message: "Invalid otp" });
      }
    } else {
      successHandler({
        res,
        status: 400,
        message: `Try after ${
          user.sendOtpAttempts.bannedAt + 350 * 1000 - Date.now()
        }`,
      });
    }
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};

// forget password
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const user = await findOne(userModel, { email });
    if (user) {
      const otp = createOtp();
      const html = template(otp, user.name, "Forget password");
      await sendEmail({ to: user.email, subject: "sarahaApp", html });
      const updatedUser = await findOneAndUpdate(
        userModel,
        { email },
        { passwordOtp: { otp, expiredIn: Date.now() + 60 * 1000 } }
      );
      successHandler({ res, status: 202, message: "OTP sended" });
    } else {
      successHandler({ res, status: 404, message: "User not found" });
    }
  } else {
    successHandler({ res, status: 401, message: "Please send email" });
  }
};

// change password
export const changePassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (email) {
    const user = await findOne(userModel, { email });
    if (user) {
      if (compare(otp, user.passwordOtp.otp)) {
        if (Date.now() <= user.passwordOtp.expiredIn) {
          const updatedUser = await findOneAndUpdate(
            userModel,
            { email },
            {
              password: newPassword,
              credentialsChangedAt: Date.now(),
            }
          );
          successHandler({
            res,
            message: "Password changed successfully, Please login again",
          });
        } else {
          successHandler({ res, status: 401, message: "Expired otp" });
        }
      } else {
        successHandler({ res, status: 401, message: "Invalid otp" });
      }
    } else {
      successHandler({ res, status: 401, message: "User not found" });
    }
  } else {
    successHandler({ res, status: 401, message: "Send email" });
  }
};

// update password
export const updatePassword = async (req, res, next) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (compare(currentPassword, user.password)) {
    for (let value of user.pastPasswords) {
      if (compare(newPassword, value)) {
        successHandler({
          res,
          status: 400,
          message: "This password used befor",
        });
      }
    }
    const arrOfPastPass = user.pastPasswords;
    arrOfPastPass.push(currentPassword);
    const updatedUser = await findOneAndUpdate(
      userModel,
      { _id: user._id },
      {
        password: newPassword,
        pastPasswords: arrOfPastPass,
        credentialsChangedAt: Date.now(),
      }
    );
    successHandler({
      res,
      message: "Password updated successfully, Please login again",
    });
  } else {
    successHandler({
      res,
      status: 400,
      message: "Current password is incorrect",
    });
  }
};

// TODO:1 Implement a verfication code for email confirmation
// TODO:2 Expired after 2 minutes
// TODO:3 Allow maximum of 5 failed attempts to use the code
// TODO:4 After 5 failed attempts, user banned for 5 minutes for requesting a new code
// TODO:5 Reset the failed attemtps count after 5 minutes
// resend otp
export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await findOne(userModel, { email });
  if (user) {
    if (
      !user.sendOtpAttempts.bannedAt ||
      user.sendOtpAttempts.bannedAt + 350 * 1000 < Date.now()
    ) {
      let otpType = "emailOtp";
      if (req.url.includes("password")) {
        otpType = "passwordOtp";
      }
      const otp = createOtp();
      const updatedUser = await findOneAndUpdate(
        userModel,
        { email },
        {
          [otpType]: {
            otp,
            expiredIn: Date.now() + 120 * 1000,
          },
        }
      );
      const html = template(otp, user.name, "OTP code");
      await sendEmail({ to: user.email, subject: "sarahaApp", html });
      successHandler({ res, status: 200, message: "OTP sended" });
    } else {
      successHandler({
        res,
        status: 400,
        message: `Try after ${
          user.sendOtpAttempts.bannedAt + 350 * 1000 - Date.now()
        }`,
      });
    }
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};

// update email
export const updateEmail = async (req, res, next) => {
  const user = req.user;
  const { newEmail } = req.body;
  const isUserExist = await findOne(userModel, { email: newEmail });
  if (!isUserExist) {
    if (user.emailConfirmed) {
      // Confirm updating proccess from old and new email
      const otpForOldEmail = createOtp();
      const otpForNewEmail = createOtp();
      const htmlForOldEmail = template(
        otpForOldEmail,
        user.name,
        "Someone try to change this email! Is that you?!"
      );
      const htmlForNewEmail = template(
        otpForNewEmail,
        user.name,
        "Is this new email you want to use"
      );
      await sendEmail({
        to: user.email,
        subject: "Saraha APP",
        html: htmlForOldEmail,
      });
      await sendEmail({
        to: newEmail,
        subject: "Saraha APP",
        html: htmlForNewEmail,
      });
      const updatedUser = await findOneAndUpdate(
        userModel,
        { _id: user._id },
        {
          emailOtp: {
            otp: otpForOldEmail,
            expiredIn: Date.now() + 240 * 1000,
          },
          newEmail: newEmail,
          newEmailOtp: {
            otp: otpForNewEmail,
            expiredIn: Date.now() + 240 * 1000,
          },
        }
      );
      return successHandler({
        res,
        message: "otp sended to old email and new email",
      });
    } else {
      return successHandler({
        res,
        status: 400,
        message: "Confirm email to update it",
      });
    }
  } else {
    return successHandler({
      res,
      status: 400,
      message: "This email already used",
    });
  }
};

// update email confirmation
export const updateEmailConfirmation = async (req, res, next) => {
  const user = req.user;
  const { otpForOldEmail, otpForNewEmail } = req.body;
  if (
    compare(otpForOldEmail, user.emailOtp.otp) &&
    compare(otpForNewEmail, user.newEmailOtp.otp) &&
    user.emailOtp.expiredIn > Date.now() &&
    user.newEmailOtp.expiredIn > Date.now()
  ) {
    const updatedUser = await findOneAndUpdate(
      userModel,
      { _id: user._id },
      {
        email: user.newEmail,
      }
    );
    return successHandler({
      res,
      message: "Email updated successfully",
    });
  } else {
    return successHandler({ res, status: 400, message: "Invalid otp" });
  }
};

// logout
export const logout = async (req, res, next) => {
  const user = req.user;
  const payload = req.payload;
  const revokeToken = await create(revokeTokenModel, {
    jti: payload.jti,
    userId: user._id,
    expiredIn: payload.iat + 7 * 24 * 60 * 60, // payload.iat return time by seconds not ms
  });
  successHandler({ res, message: "Logged out done" });
};

export const logoutFromAllDevices = async (req, res, next) => {
  const user = req.user;
  const updatedUser = findOneAndUpdate(
    userModel,
    { _id: user._id },
    { credentialsChangedAt: Date.now() }
  );
  successHandler({ res, message: "Logged out from all devices successfully" });
};
