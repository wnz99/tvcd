// export type WsApiCandle = {
//   time: number;
//   open: number;
//   close: number;
//   high: number;
//   low: number;
//   volume: number;
// };

export type RestApiCandle =
  | {
      T: string;
      O: number;
      H: number;
      L: number;
      C: number;
      V: number;
    } & {
      time: number;
      open: number;
      close: number;
      high: number;
      low: number;
      volume: number;
    };

export type SubscribeData = {
  event: 'subscribed' | 'unsubscribed';
  channel: string;
  chanId: number;
  key: string;
  status?: 'OK';
};

export type BittrexCandle = RestApiCandle;
