const pingWs = (
  sendFn: (msg: string) => void,
  cbFn: (time: number) => void,
  pingMsg: string,
  pingTime: number
): NodeJS.Timeout =>
  setInterval(() => {
    sendFn(pingMsg)

    cbFn(new Date().getTime())
  }, pingTime)

export default pingWs
