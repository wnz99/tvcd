/* eslint-disable no-console */
const debugError = (message, isDebug) => {
  if (isDebug) {
    console.log(`tvcd => ${message}`);
  }
  return new Error(message);
};

export default debugError;
