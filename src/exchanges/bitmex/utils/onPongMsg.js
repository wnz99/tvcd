const onPongMsg = (err, event) => {
  if (event.data === 'pong') {
    return new Date().getTime();
  }
  return undefined;
};

export default onPongMsg;
