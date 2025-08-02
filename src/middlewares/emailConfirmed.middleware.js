export const emailConfirmed = async (req, res, next) => {
  const user = req.user;
  if (user.emailConfirmed) {
    return next();
  } else {
    next(new Error("Email not confirmed"));
  }
};
