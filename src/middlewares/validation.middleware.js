export const validation = (schema) => {
  return (req, res, next) => {
    const result = schema.body.validate(req.body, { abortEarly: false });
    if (!result.error) {
      return next();
    } else {
      return next(new Error(result.error));
    }
  };
};
