import { Subject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import _pick from 'lodash/pick';

import { CandlesData } from '../types';
import { isChannelChanged } from '../utils';

const data$ = (
  channels: string[],
  stream$: Subject<CandlesData>
): Observable<CandlesData> =>
  stream$.pipe(
    map((data) => {
      if (channels && channels.length) return _pick(data, channels);

      return data;
    }),
    distinctUntilChanged((prev, curr) => !isChannelChanged(prev, curr))
  );
export default data$;
