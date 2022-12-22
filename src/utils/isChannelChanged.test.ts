import { CandlesData } from '../types'
import isChannelChanged from './isChannelChanged'

describe('isChannelChanged function', () => {
  it('should return TRUE if channels have changed', () => {
    let prevChans = {} as unknown as CandlesData

    let currChans = {
      chan1: {
        seq: 1,
      },
    } as unknown as CandlesData

    expect(isChannelChanged(prevChans, currChans)).toBe(true)

    prevChans = {
      chan1: {
        seq: 0,
      },
    } as unknown as CandlesData

    currChans = {
      chan1: {
        seq: 1,
      },
    } as unknown as CandlesData

    expect(isChannelChanged(prevChans, currChans)).toBe(true)

    prevChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    } as unknown as CandlesData

    currChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 1,
      },
    } as unknown as CandlesData

    expect(isChannelChanged(prevChans, currChans)).toBe(true)
  })

  it('should return FALSE if channels have not changed', () => {
    let prevChans = {
      chan1: {
        seq: 0,
      },
    } as unknown as CandlesData

    let currChans = {
      chan1: {
        seq: 0,
      },
    } as unknown as CandlesData

    expect(isChannelChanged(prevChans, currChans)).toBe(false)

    prevChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    } as unknown as CandlesData

    currChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    } as unknown as CandlesData

    expect(isChannelChanged(prevChans, currChans)).toBe(false)
  })
})
