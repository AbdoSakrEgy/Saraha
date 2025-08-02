import bcrypt from "bcrypt";

export const hash = (text) => {
  return bcrypt.hashSync(text, Number(process.env.SALT));
};

export const compare = (text, hashedText) => {
  return bcrypt.compareSync(text, hashedText);
};
