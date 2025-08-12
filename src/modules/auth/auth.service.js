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

// ! One account soft deleted, and trying to register new account with the same email. What logic should i do.
// register
export const register = async (req, res, next) => {
  const { name, email, password, age, role, gender, phone } = req.body;
  const user = await findOne(userModel, { email }); // {}||null
  if (!user) {
    const otp = createOtp();
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
        expiredIn: Date.now() + 60 * 1000,
      },
    });
    const payload = {
      id: user._id,
      email: user.email,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
      expiresIn: "1 h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
      expiresIn: "7 d",
    });
    // Send email
    // I see emailEmmiter and errorClass didn't add any thing usefull.
    const html = template(otp, user.name, "Confirm email");
    await sendEmail({ to: user.email, subject: "sarahaApp", html });
    successHandler({ res, status: 201, data: { accessToken, refreshToken } });
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
        const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
          expiresIn: `1 h`,
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
          expiresIn: "7 d",
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
      if (user.provider != Providers.system) {
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
        const accessToken = jwt.sign(payload, process.env.ACCESS_SEGNATURE, {
          expiresIn: "1 h",
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SEGNATURE, {
          expiresIn: "7 d",
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
  const user = await decodeToken(authorization, tokenTypes.refresh, next);
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_SEGNATURE,
    { expiresIn: "1 h" }
  );
  successHandler({ res, data: { accessToken } });
};

// confirm email
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await findOne(userModel, { email });
  if (user) {
    if (compare(otp, user.emailOtp.otp)) {
      if (Date.now() <= user.emailOtp.expiredIn) {
        await findOneAndUpdate(userModel, { email }, { emailConfirmed: true });
        successHandler({ res });
      } else {
        successHandler({ res, status: 401, message: "Expired otp" });
      }
    } else {
      successHandler({ res, status: 401, message: "Invalid otp" });
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

// resend otp
export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await findOne(userModel, { email });
  if (user) {
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
          expiredIn: Date.now() + 60 * 1000,
        },
      }
    );
    const html = template(otp, user.name, "OTP code");
    await sendEmail({ to: user.email, subject: "sarahaApp", html });
    successHandler({ res, status: 200, message: "OTP sended" });
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
