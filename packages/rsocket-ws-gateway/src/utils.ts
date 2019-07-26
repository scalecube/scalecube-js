export const packError = (e) => {
  try {
    const message = JSON.stringify(e);
    return new Error(message);
  } catch (err) {
    return e;
  }
};
