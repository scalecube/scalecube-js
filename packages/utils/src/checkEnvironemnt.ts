export const isNodejs = () => {
  try {
    // common api for main threat or worker in the browser
    return !navigator;
  } catch (e) {
    return false;
  }
};
