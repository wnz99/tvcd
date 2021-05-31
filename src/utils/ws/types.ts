import WS from 'ws';

interface WSInstanceA extends WebSocket {
  subs: {
    [key: string]: any;
  };
  isShutDown: boolean;
  addSubscription: (subscription: Subscription) => void;
  deleteSubscription: (subscriptionKey: string) => void;
  closeConnection: () => void;
}

type WSInstanceB = WS & {
  subs: {
    [key: string]: any;
  };
  isShutDown: boolean;
  addSubscription: (subscription: Subscription) => void;
  deleteSubscription: (subscriptionKey: string) => void;
  closeConnection: () => void;
};

export type WSInstance = WSInstanceA | WSInstanceB;

export type Subscription = {
  [key: string]: { [key: string]: unknown } | string;
};

export type SendFn = (msg: string) => void;

export type WsEvent = {
  data: string;
  type: string;
  target: WebSocket;
};

export type Options = {
  initMsg: any[];
  keepAlive: boolean;
  keepAliveMsg: string;
  keepAliveTime: number;
  keepAliveTimeout: number;
  maxRetry: number;
  onCloseCb?: (event: {
    wasClean: boolean;
    code: number;
    reason: string;
    target: WebSocket;
  }) => void;
  onErrorCb?: (err: {
    error: any;
    message: any;
    type: string;
    target: WebSocket;
  }) => void;
  onMessageCb?: (event: { data: any; type: string; target: WebSocket }) => void;
  onOpenCb?: (event: { target: WebSocket }) => void;
  onPongCb?: (event: WsEvent) => number | null;
  onReconnectCb?: (ws: WSInstance) => void;
  onSubscriptionCb?: (
    event: {
      data: any;
      type: string;
      target: WebSocket;
    },
    subs: { [key: string]: any }
  ) => { [key: string]: any };
  retryDelay: number;
  subs:
    | {
        [key: string]: any;
      }
    | undefined;
};
