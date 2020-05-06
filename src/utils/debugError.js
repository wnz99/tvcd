/* eslint-disable no-console */
const debugError = (message, isDebug) => {
  if (isDebug) {
    console.warn(message);
  }
  return new Error(message);
};

export default debugError;
