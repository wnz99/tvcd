export type RestApiCandle = {
  date: number;
  close: number;
  high: number;
  low: number;
  open: number;
  startTime: string;
  volume: number;
  time: number;
};

export type PoloniexCandle = RestApiCandle;
