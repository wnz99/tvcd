import { StreamData } from '../../types';

type CandlesSubscription = {
  id: number;
  type: string;
  topic: string;
  privateChannel: boolean;
  response: boolean;
};

export type WsSubscriptions = {
  [key: string]: CandlesSubscription;
};

export type PongData = {
  id: string;
  type: 'pong';
};

export type UpdateData = {
  type: string;
  subject: 'trade.candles.update';
  topic: 'string';
  data: {
    candles: [string, string, string, string, string, string, string];
    symbol: string;
    c: string;
    time: number;
  };
};

export type CandlesStreamData = StreamData<UpdateData['data']['candles']>;

export type DataStream = {
  data: string;
};

export type WsApiCandle = [
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type RestApiCandle = [
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type KucoinCandle = WsApiCandle | RestApiCandle;
