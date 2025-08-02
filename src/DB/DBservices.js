export const findOne = async (model, filter = {}, populate = []) => {
  const doc = await model.findOne(filter).populate(populate);
  return doc;
};

export const findById = async (model, filter = {}, populate = []) => {
  const doc = await model.findById(filter).populate(populate);
  return doc;
};

export const find = async (model, filter = {}, populate = []) => {
  const doc = await model.find(filter).populate(populate);
  return doc;
};

export const create = async (model, data = {}) => {
  const doc = await model.create(data);
  return doc;
};

export const findOneAndUpdate = async (
  model,
  filter = {},
  data = {},
  options = { new: true }
) => {
  const doc = await model.findOneAndUpdate(filter, data, options);
  return doc;
};

export const findByIdAndUpdate = async (
  model,
  filter,
  data,
  options = { new: true }
) => {
  const doc = await model.findByIdAndUpdate(filter, data, options);
  return doc;
};

export const findOneAndDelete = async (
  model,
  filter = {},
  options = { new: true }
) => {
  const doc = await model.findOneAndDelete(filter, options);
  return doc;
};

export const findByIdAndDelete = async (
  model,
  filter,
  options = { new: true }
) => {
  const doc = await model.findByIdAndDelete(filter, options);
  return doc;
};
