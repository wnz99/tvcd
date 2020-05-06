const onPongMsg = (err, event) => {
  const msg = JSON.parse(event.data);

  return msg.ts;
};

export default onPongMsg;
