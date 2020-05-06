import { timer, from } from 'rxjs';
import { tap, delayWhen, retryWhen, switchMap } from 'rxjs/operators';
import { INTERVALS_CONVERSION } from '../const';

const getTicker$ = (channel, restRootUrl) => {
  const { interval, symbols } = channel;
  const tickInterval = INTERVALS_CONVERSION[interval];
  return from(
    fetch(
      `${restRootUrl}/market/GetLatestTick?marketName=${symbols[1]}-${symbols[0]}&tickInterval=${tickInterval}`
    )
  ).pipe(
    switchMap(async (response) => {
      if (response.status === 200) {
        const responseBody = await response.json();
        return [`${symbols[0]}${symbols[1]}`, responseBody.result[0], interval];
      }
      throw new Error(`Error ${response.status}`);
    }),
    retryWhen((errors) =>
      errors.pipe(
        // eslint-disable-next-line no-console
        tap(() => console.log('Retrying...')),
        delayWhen(() => timer(1000))
      )
    )
  );
};

export default getTicker$;
