import { Subject } from 'rxjs'

global.mocksClear = (mocks) => mocks.forEach((mock) => mock.mockClear())

global.wsTestInstance$ = new Subject()
