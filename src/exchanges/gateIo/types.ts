import { StreamData } from '../../types';

type CandlesSubscription = {
  id: number;
  time: number;
  channel: string;
  event: string;
  payload: [string, string];
};

export type WsSubscriptions = {
  [key: number]: CandlesSubscription;
};

export type PongData = {
  time: number;
  channel: 'spot.pong';
  event: '';
  error: unknown;
  result: unknown;
};

export type UpdateData = {
  id: number;
  time: number;
  channel: 'spot.candlesticks';
  event: 'update';
  result: {
    t: string;
    v: string;
    c: string;
    h: string;
    l: string;
    o: string;
    n: string;
  };
};

export type CandlesStreamData = StreamData<UpdateData['result']>;

export type DataStream = {
  data: string;
};

export type WsApiCandle = {
  t: string;
  v: string;
  c: string;
  h: string;
  l: string;
  o: string;
  n: string;
};

export type RestApiCandle = [number, number, number, number, number, number];

export type GateIoCandle = WsApiCandle | RestApiCandle;
