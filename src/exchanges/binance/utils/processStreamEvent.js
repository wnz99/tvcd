const processStreamEvent = (event) => {
  const msg = JSON.parse(event.data);

  if (msg && msg.data && msg.data.k) {
    const ticker = msg.data.s;
    const interval = msg.data.k.i;
    const data = [
      msg.data.k.t,
      Number(msg.data.k.o),
      Number(msg.data.k.h),
      Number(msg.data.k.l),
      Number(msg.data.k.c),
      Number(msg.data.k.v),
      msg.data.k.x,
    ];
    return [ticker, data, interval];
  }

  return null;
};

export default processStreamEvent;
