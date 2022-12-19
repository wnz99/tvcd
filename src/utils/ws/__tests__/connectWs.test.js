import { WebSocket, Server } from 'mock-socket';
import omit from 'lodash/omit';
import reconnectWs from '../reconnectWs';
import connectWs from '../connectWs';

jest.mock('../reconnectWs');

const wsUrl = 'ws://localhost:8080';
let mockServer;
let ws;

const spyCbFn = {
  onOpenCb: jest.fn(),
  onCloseCb: jest.fn(),
  onErrorCb: jest.fn(),
  onMessageCb: jest.fn(),
  onPongCb: jest.fn(),
};

const onSubscriptionMsg = (event, subs) => {
  const msg = JSON.parse(event.data);

  switch (msg.event) {
    case 'subscribed': {
      const { channel, key } = msg;
      return {
        ...subs,
        [msg.chanId]: {
          channel,
          key,
          event: 'subscribe',
        },
      };
    }
    case 'unsubscribed': {
      return omit(subs, [msg.chanId]);
    }
    default:
      return subs;
  }
};

describe('connectWs function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(spyCbFn).forEach((fn) => {
      spyCbFn[fn].mockClear();
    });
    mockServer = new Server(wsUrl);
  });

  afterEach(() => {
    mockServer.close();
    ws.closeConnection();
    jest.clearAllTimers();
  });

  it('returns a ws instance success', () => {
    const connOpts = {
      ...spyCbFn,
    };
    ws = connectWs(wsUrl, connOpts);
    expect(ws).toBeInstanceOf(WebSocket);
    expect(ws).toHaveProperty('subs');
    expect(ws.subs).toEqual({});
  });

  it('saves subscriptions success', (done) => {
    const connOpts = {
      ...spyCbFn,
      onSubscriptionCb: onSubscriptionMsg,
    };
    mockServer.on('connection', (socket) => {
      let chanId = 400;
      socket.on('message', (data) => {
        chanId += 1;
        const msg = JSON.parse(data);
        if (msg.event === 'subscribe') {
          socket.send(
            JSON.stringify({
              event: 'subscribed',
              channel: msg.channel,
              chanId,
              symbol: msg.symbol,
              pair: msg.symbol.substring(1),
            })
          );
        }
        if (msg.event === 'unsubscribe') {
          socket.send(
            JSON.stringify({
              event: 'unsubscribed',
              status: 'OK',
              chanId: msg.chanId,
            })
          );
        }
      });
    });
    ws = connectWs(wsUrl, connOpts);
    ws.send(
      JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tETHUSD',
      })
    );
    ws.send(
      JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tNECETH',
      })
    );
    jest.advanceTimersByTime(100);
    expect(Object.keys(ws.subs).length).toBe(2);
    ws.send(
      JSON.stringify({
        event: 'unsubscribe',
        chanId: Object.keys(ws.subs)[0],
      })
    );
    jest.advanceTimersByTime(100);
    expect(Object.keys(ws.subs).length).toBe(1);
    jest.advanceTimersByTime(100);
    ws.send(
      JSON.stringify({
        event: 'unsubscribe',
        chanId: Object.keys(ws.subs)[0],
      })
    );
    jest.advanceTimersByTime(100);
    expect(Object.keys(ws.subs).length).toBe(0);
    done();
  });

  it('pings success', (done) => {
    const connOpts = {
      ...spyCbFn,
      keepAlive: true,
      keepAliveMsg: JSON.stringify({ event: 'ping' }),
    };
    mockServer.on('connection', (socket) => {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);

        if (msg.event === 'ping') {
          socket.send(
            JSON.stringify({
              event: 'pong',
              ts: '123',
            })
          );
        }
      });
    });
    ws = connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(2500);
    expect(spyCbFn.onPongCb).toHaveBeenCalled();
    done();
  });
});

describe('open event', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(spyCbFn).forEach((fn) => {
      spyCbFn[fn].mockClear();
    });
    mockServer = new Server(wsUrl);
  });

  afterEach(() => {
    mockServer.close();
    ws.closeConnection();
    jest.clearAllTimers();
  });

  it('event listener open success', (done) => {
    const initMsg = [
      {
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tNECETH',
      },
      {
        event: 'subscribe',
        channel: 'book',
        symbol: 'tNECETH',
      },
    ];
    const connOpts = {
      ...spyCbFn,
      keepAlive: true,
      keepAliveMsg: JSON.stringify({ event: 'ping' }),
      initMsg,
    };
    const expectedMsg = [
      { event: 'subscribe', channel: 'ticker', symbol: 'tNECETH' },
      { event: 'subscribe', channel: 'book', symbol: 'tNECETH' },
      { event: 'ping' },
    ];
    const receivedMsg = [];
    mockServer.on('connection', (socket) => {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        receivedMsg.push(msg);
      });
    });
    connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(100);
    expect(connOpts.onOpenCb).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(receivedMsg).toEqual(expectedMsg);
    done();
  });

  it('resubscribe on open success', (done) => {
    const initMsg = [
      {
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tNECETH',
      },
    ];
    const subs = {
      123: {
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tETHUSD',
      },
      456: {
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tBTCUSD',
      },
    };
    const connOpts = {
      ...spyCbFn,
      initMsg,
      keepAlive: true,
      keepAliveMsg: JSON.stringify({ event: 'ping' }),
      subs,
    };
    const expectedMsg = [
      { event: 'subscribe', channel: 'ticker', symbol: 'tETHUSD' },
      { event: 'subscribe', channel: 'ticker', symbol: 'tBTCUSD' },
      { event: 'ping' },
    ];
    const receivedMsg = [];
    mockServer.on('connection', (socket) => {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        receivedMsg.push(msg);
      });
    });
    connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(100);
    expect(connOpts.onOpenCb).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(receivedMsg).toEqual(expectedMsg);
    done();
  });

  it('keeps connection alive success', (done) => {
    const connOpts = {
      ...spyCbFn,
      keepAlive: true,
      keepAliveMsg: JSON.stringify({ event: 'ping' }),
    };
    const expectedMsg = [
      { event: 'ping' },
      { event: 'ping' },
      { event: 'ping' },
      { event: 'ping' },
    ];
    const receivedMsg = [];
    mockServer.on('connection', (socket) => {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        receivedMsg.push(msg);
      });
    });
    connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(10000);
    expect(receivedMsg).toEqual(expectedMsg);
    done();
  });
});

describe('close event', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(spyCbFn).forEach((fn) => {
      spyCbFn[fn].mockClear();
    });
    mockServer = new Server(wsUrl);
  });

  afterEach(() => {
    mockServer.close();
    ``;
    ws.closeConnection();
    jest.clearAllTimers();
  });

  it.only('event listener clean close success', (done) => {
    const connOpts = {
      ...spyCbFn,
      keepAlive: { msg: { event: 'ping' } },
    };
    ws = connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(100);
    mockServer.close();
    jest.advanceTimersByTime(100);
    expect(connOpts.onCloseCb).not.toHaveBeenCalled();
    expect(reconnectWs).not.toHaveBeenCalled();
    done();
  });

  it('event listener not clean close success', (done) => {
    const connOpts = {
      ...spyCbFn,
    };
    ws = connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(100);
    mockServer.close({
      code: 3000,
      reason: 'Error',
      wasClean: false,
    });
    // mockServer.close(3000, 'error');
    jest.advanceTimersByTime(100);
    expect(connOpts.onCloseCb).toHaveBeenCalledTimes(1);
    expect(reconnectWs).toHaveBeenCalled();
    done();
  });
});

describe('error event', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.keys(spyCbFn).forEach((fn) => {
      spyCbFn[fn].mockClear();
    });
    mockServer = new Server(wsUrl);
  });

  afterEach(() => {
    mockServer.close();
    ws.close();
    jest.clearAllTimers();
  });

  it('event listener error from server success', (done) => {
    const connOpts = {
      ...spyCbFn,
    };
    connectWs(wsUrl, connOpts);
    mockServer.simulate('error');
    jest.advanceTimersByTime(100);
    expect(connOpts.onErrorCb).toHaveBeenCalledTimes(1);
    mockServer.close();

    mockServer = new Server(wsUrl);
    connectWs(wsUrl);
    jest.advanceTimersByTime(100);
    mockServer.close();
    jest.advanceTimersByTime(100);
    done();
  });

  it('event listener error no connection to server success', (done) => {
    const connOpts = {
      ...spyCbFn,
    };
    mockServer.close();
    jest.advanceTimersByTime(100);
    connectWs(wsUrl, connOpts);
    jest.advanceTimersByTime(100);
    expect(connOpts.onErrorCb).toHaveBeenCalledTimes(1);

    connectWs(wsUrl);
    jest.advanceTimersByTime(100);
    mockServer.close();
    jest.advanceTimersByTime(100);
    done();
  });
});
