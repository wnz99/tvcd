import _pick from 'lodash/pick'
import { Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { CandlesData } from '../types'
import { isChannelChanged } from '../utils'

const data$ = (
  channels: string[] = [],
  stream$: Subject<CandlesData>
): Observable<CandlesData> =>
  stream$.pipe(
    map((data) => {
      if (channels.length !== 0) return _pick(data, channels)

      return data
    }),
    distinctUntilChanged((prev, curr) => !isChannelChanged(prev, curr))
  )
export default data$
