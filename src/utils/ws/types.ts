import WS from 'ws';

export type WSInstance = (WebSocket | WS) & {
  subs?: {
    [key: string]: any;
  };
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
