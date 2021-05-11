export type UdfData = {
  s: string;
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
};

type Data = {
  close: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  volume: number;
};

const processUdfData = (data: UdfData): Data[] => {
  if (data.s === 'no_data') {
    return [];
  }

  return data.t.map((timestamp: number, index: number) => ({
    close: data.c[index],
    high: data.h[index],
    low: data.l[index],
    open: data.o[index],
    timestamp: timestamp * 1000,
    volume: data.v[index],
  }));
};

export default processUdfData;
