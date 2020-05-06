import { map, distinctUntilChanged } from 'rxjs/operators';
import pick from 'lodash/pick';

import { isChannelChanged } from '../utils';

const data$ = (channels, stream$) =>
  stream$.pipe(
    map((data) => {
      if (channels && channels.length) return pick(data, channels);

      return data;
    }),
    distinctUntilChanged((prev, curr) => !isChannelChanged(prev, curr))
  );
export default data$;
