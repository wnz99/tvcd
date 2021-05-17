const onPongMsg = (event) => {
  if (event.data) {
    try {
      const data = JSON.parse(event.data);

      return data.ts;
    } catch (_e) {
      return null;
    }
  }
};

export default onPongMsg;
