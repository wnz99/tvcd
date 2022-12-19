import { TestScheduler } from 'rxjs/testing'

import { data$ } from '../'

let testScheduler

describe('data$ observable', () => {
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
  })

  it('should emit a message', () => {
    const channels = ['chan1', 'chan2']
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers
      const stream$ = cold('a', {
        a: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 2,
            seq: 0,
          },
        },
      })
      const expectedMarble = 'a'
      const expectedValues = {
        a: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 2,
            seq: 0,
          },
        },
      }
      expectObservable(data$(channels, stream$)).toBe(
        expectedMarble,
        expectedValues
      )
    })
  })

  it('should emit a message only if data contains an update', () => {
    const channels = ['chan1', 'chan2']
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers
      const stream$ = cold('abc', {
        a: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 2,
            seq: 0,
          },
        },
        b: {
          chan1: {
            value: 2,
            seq: 0,
          },
          chan2: {
            value: 2,
            seq: 0,
          },
        },
        c: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 3,
            seq: 1,
          },
        },
      })
      const expectedMarble = 'a-b'
      const expectedValues = {
        a: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 2,
            seq: 0,
          },
        },
        b: {
          chan1: {
            value: 1,
            seq: 0,
          },
          chan2: {
            value: 3,
            seq: 1,
          },
        },
      }
      expectObservable(data$(channels, stream$)).toBe(
        expectedMarble,
        expectedValues
      )
    })
  })
})
