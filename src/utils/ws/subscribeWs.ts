/* eslint no-console: ["error", { allow: ["warn"] }] */
import { SendFn } from './types'

export const catchErr = (sendFn: SendFn, msg: string): void => {
  try {
    sendFn(msg)
  } catch (e) {
    console.warn(e)
  }
}

export const subPair =
  (sendFn: SendFn) =>
  (pair: string, channel: string): void => {
    let msg

    switch (channel) {
      case 'ticker': {
        msg = JSON.stringify({
          event: 'subscribe',
          channel,
          symbol: `t${pair}`,
        })
        break
      }
      case 'book': {
        msg = JSON.stringify({
          event: 'subscribe',
          channel,
          symbol: `t${pair}`,
          freq: 'F1',
          prec: 'P0',
        })
        break
      }
      default:
    }

    if (msg) {
      catchErr(sendFn, msg)
    }
  }

export const unsubPair =
  (sendFn: SendFn) =>
  (chanId: string): void => {
    const msg = JSON.stringify({
      event: 'unsubscribe',
      chanId,
    })

    catchErr(sendFn, msg)
  }
