const processUdfData = (data) => {
  if (data.s === 'no_data') {
    return [];
  }

  return data.t.map((timestamp, index) => {
    return {
      close: data.c[index],
      high: data.h[index],
      low: data.l[index],
      open: data.o[index],
      timestamp: timestamp * 1000,
      volume: data.v[index],
    };
  });
};

export default processUdfData;
