export const allMessages = (req, res) => {
  try {
    return res.status(201).json({ message });
  } catch (err) {
    return res.status(501).json({ err });
  }
};
