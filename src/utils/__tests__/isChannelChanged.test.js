import isChannelChanged from '../isChannelChanged'

describe('isChannelChanged function', () => {
  it('should return TRUE if channels have changed', () => {
    let prevChans = {}
    let currChans = {
      chan1: {
        seq: 1,
      },
    }

    expect(isChannelChanged(prevChans, currChans)).toBe(true)

    prevChans = {
      chan1: {
        seq: 0,
      },
    }
    currChans = {
      chan1: {
        seq: 1,
      },
    }

    expect(isChannelChanged(prevChans, currChans)).toBe(true)

    prevChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    }
    currChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 1,
      },
    }

    expect(isChannelChanged(prevChans, currChans)).toBe(true)
  })

  it('should return FALSE if channels have not changed', () => {
    let prevChans = {
      chan1: {
        seq: 0,
      },
    }
    let currChans = {
      chan1: {
        seq: 0,
      },
    }

    expect(isChannelChanged(prevChans, currChans)).toBe(false)

    prevChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    }
    currChans = {
      chan1: {
        seq: 0,
      },
      chan2: {
        seq: 0,
      },
    }

    expect(isChannelChanged(prevChans, currChans)).toBe(false)
  })
})
