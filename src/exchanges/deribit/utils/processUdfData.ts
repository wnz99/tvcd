import { ProcessUfdDataReturn } from '../../../utils/processUdfData'

export type UdfData = {
  usOut: number
  usIn: number
  usDiff: number
  testnet: false
  result: {
    volume: number[]
    ticks: number[]
    status: 'ok' | 'no_data'
    open: number[]
    low: number[]
    high: number[]
    cost: number[]
    close: number[]
  }
  jsonrpc: string
}

export const processUdfData = (
  data: UdfData['result']
): ProcessUfdDataReturn => {
  const { status, close, high, low, open, volume, ticks } = data

  if (status === 'no_data') {
    return []
  }

  return ticks.map((timestamp: number, index: number) => ({
    close: close[index],
    high: high[index],
    low: low[index],
    open: open[index],
    timestamp: timestamp,
    volume: volume[index],
  }))
}
