const dataMethods = ["body", "params", "query", "file", "files"];

export const validation = (schema) => {
  return (req, res, next) => {
    const errors = [];
    dataMethods.forEach((value) => {
      if (value != "files") {
        const result = schema[value]?.validate(req[value], {
          abortEarly: false,
        });
        if (result?.error) {
          errors.push(result.error);
        }
      } else if (value == "files" && req[value]) {
        for (const item of req[value]) {
          const result = schema[value]?.validate(item, {
            abortEarly: false,
          });
          if (result?.error) {
            errors.push(result.error);
          }
        }
      }
    });
    if (!errors.length > 0) {
      return next();
    } else {
      return next(new Error(errors));
    }
  };
};
