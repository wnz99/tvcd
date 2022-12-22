/* eslint-disable @typescript-eslint/ban-ts-comment */
import omit from 'lodash/omit'

// import WS from 'ws';
import conf from './env'
import pingWs from './pingWs'
// eslint-disable-next-line import/no-cycle
import reconnectWs from './reconnectWs'
import { Options, Subscription, WsEvent, WSInstance } from './types'

function connectWs(url: string, opts: Partial<Options> = {}): WSInstance {
  const defOpts: Options = {
    initMsg: [],
    keepAlive: false,
    keepAliveMsg: 'ping',
    keepAliveTime: conf.wsPingTime,
    keepAliveTimeout: conf.wsTimeout,
    maxRetry: conf.wsMaxRetry,
    onCloseCb: undefined,
    onErrorCb: undefined,
    onMessageCb: undefined,
    onOpenCb: undefined,
    onPongCb: (event: WsEvent) => {
      return event.data === 'pong' ? new Date().getTime() : null
    },
    onReconnectCb: undefined,
    onSubscriptionCb: undefined,
    retryDelay: conf.wsRetryDelay,
    subs: {},
  }

  const connOpts: Options = {
    ...defOpts,
    ...opts,
  }

  const {
    onOpenCb,
    onCloseCb,
    onMessageCb,
    onErrorCb,
    onSubscriptionCb,
    onPongCb,
    keepAlive,
    keepAliveMsg,
    keepAliveTime,
    keepAliveTimeout,
  } = connOpts

  const ws =
    typeof window !== 'undefined' && window.WebSocket
      ? (new WebSocket(url) as WSInstance)
      : (new WebSocket(url) as WSInstance)

  let pongTime = new Date().getTime()

  let td: NodeJS.Timeout

  const isStaleFn = (pingTime: number) => {
    if (pingTime - pongTime > keepAliveTimeout) {
      try {
        ws.close(3000, 'Connection timeout.')
      } catch (e) {
        if (e instanceof Error) {
          console.warn(e.message)
        }
      }

      if (td) {
        clearInterval(td)
      }
    }
  }

  ws.subs = connOpts.subs || {}

  ws.isShutDown = false

  ws.addSubscription = (subscription: Subscription) => {
    ws.subs = { ...ws.subs, ...subscription }
  }

  ws.deleteSubscription = (subscriptionKey: string) => {
    ws.subs = omit(ws.subs, subscriptionKey)
  }

  // @ts-ignore
  ws.addEventListener('open', (event) => {
    if (keepAlive && ws.readyState === 1) {
      td = pingWs(ws.send.bind(ws), isStaleFn, keepAliveMsg, keepAliveTime)
    }

    const { initMsg } = connOpts

    // @ts-ignore
    const subs = Object.keys(ws.subs)

    if (initMsg.length && !subs.length) {
      initMsg.forEach((sub) => {
        ws.send(JSON.stringify(sub))
      })
    } else {
      subs.forEach((sub) => {
        const msg =
          typeof ws.subs[sub] === 'object'
            ? JSON.stringify(ws.subs[sub])
            : ws.subs[sub]

        ws.send(msg)
      })
    }

    if (onOpenCb) {
      onOpenCb(event)
    }
  })

  // @ts-ignore
  ws.addEventListener(
    'close',
    (event: {
      wasClean: boolean
      code: number
      reason: string
      target: WebSocket
    }) => {
      if (td) {
        clearInterval(td)
      }
      // In Chrome ws.close(1000) will produce a close event with code 1006
      if (event.wasClean || ws.isShutDown) {
        return
      }

      if (event.code !== 1000 && event.code !== 1006) {
        reconnectWs(url, {
          ...connOpts,
          subs: {
            ...ws.subs,
          },
        })
      }

      if (onCloseCb) {
        onCloseCb(event)
      }
    }
  )

  // @ts-ignore
  ws.addEventListener('error', (err) => {
    if (onErrorCb) {
      onErrorCb(err)
    }
  })

  // @ts-ignore
  ws.addEventListener('message', (event: WsEvent) => {
    if (onSubscriptionCb) {
      ws.subs = onSubscriptionCb(event, {
        ...ws.subs,
      })
    }

    if (onPongCb) {
      const timeStamp = onPongCb(event)

      if (timeStamp) {
        pongTime = timeStamp
      }
    }

    if (onMessageCb) {
      onMessageCb(event)
    }
  })

  ws.closeConnection = () => {
    ws.isShutDown = true

    ws.close(1000, 'Close handle was called')
  }

  return ws
}

export default connectWs
