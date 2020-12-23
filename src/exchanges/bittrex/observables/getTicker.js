import { timer, from } from 'rxjs';
import { delayWhen, retryWhen, switchMap } from 'rxjs/operators';
import { INTERVALS_CONVERSION } from '../const';

const getTicker$ = (channel, restRootUrl) => {
  const { intervalApi, symbols } = channel;

  const tickInterval = INTERVALS_CONVERSION[intervalApi];

  return from(
    fetch(
      `${restRootUrl}/market/GetLatestTick?marketName=${symbols[1]}-${symbols[0]}&tickInterval=${tickInterval}`
    )
  ).pipe(
    switchMap(async (response) => {
      if (response.status === 200) {
        const responseBody = await response.json();

        return [
          `${symbols[0]}${symbols[1]}`,
          responseBody.result[0],
          intervalApi,
        ];
      }
      throw new Error(`Error ${response.status}`);
    }),
    retryWhen((errors) => errors.pipe(delayWhen(() => timer(1000))))
  );
};

export default getTicker$;
