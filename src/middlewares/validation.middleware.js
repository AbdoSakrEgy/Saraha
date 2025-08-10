const dataMethods = ["body",  "params", "query"];

export const validation = (schema) => {
  return (req, res, next) => {
    const errors = [];
    dataMethods.forEach((value) => {
      const result = schema[value]?.validate(req[value], { abortEarly: false });
      if (result?.error) {
        errors.push(result.error);
      }
    });
    if (!errors.length > 0) {
      return next();
    } else {
      return next(new Error(errors));
    }
  };
};
