export const allowTo = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (roles.includes(user.role)) {
      next();
    } else {
      next(new Error("You are not authorized to access this end point"));
    }
  };
};
