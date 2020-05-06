import { WebSocket, Server } from 'mock-socket';
import { Observable } from 'rxjs';
import connectWs from '../../../utils/ws/connectWs';
import makeDataStream from '../utils/makeDataStream';

jest.mock('../../../utils/ws/connectWs');

const wsUrl = 'ws://localhost:8080';
let mockServer;
let ws = new WebSocket(wsUrl);

const spyCbFn = {
  onOpenCb: jest.fn(),
  onCloseCb: jest.fn(),
  onErrorCb: jest.fn(),
  onMessageCb: jest.fn(),
};

beforeEach(() => {
  jest.useFakeTimers();
  Object.keys(spyCbFn).forEach((fn) => {
    spyCbFn[fn].mockClear();
  });
  mockServer = new Server(wsUrl);
  ws = new WebSocket(wsUrl);
  connectWs.mockImplementation(() => ws);
});

afterEach(() => {
  mockServer.close();
  jest.clearAllTimers();
});

describe('makeDataStream function', () => {
  it('returns dataFeed obsevables success', () => {
    const dataFeed$ = makeDataStream(wsUrl, {});
    expect(dataFeed$).toBeInstanceOf(Observable);
  });
});
