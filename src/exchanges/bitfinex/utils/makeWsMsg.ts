import { Pair } from '../../../types'
import makePair from './makePair'

const makeWsMsg = (
  messageType: string,
  pair: Pair
): { [key: string]: unknown } | string | undefined => {
  const { intervalApi, symbols } = pair

  const key = `trade:${intervalApi}:t${makePair(symbols[0], symbols[1])}`

  switch (messageType) {
    case 'subscribe': {
      return {
        event: 'subscribe',
        channel: 'candles',
        key,
      }
    }

    case 'unsubscribe': {
      return {
        event: 'unsubscribe',
        id: pair.ws?.meta?.chanid,
      }
    }

    default:
      return undefined
  }
}

export default makeWsMsg
