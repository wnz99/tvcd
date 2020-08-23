import { timer, defer } from 'rxjs';
import { tap, delayWhen, retryWhen, switchMap } from 'rxjs/operators';

export const fetchCandles$ = (restApiUrl, requestOptions = {}) => {
  return defer(() => fetch(restApiUrl, requestOptions)).pipe(
    switchMap(async (response) => {
      if (response.status === 200) {
        const responseBody = await response.json();

        if (responseBody.data) {
          return responseBody.data;
        }

        if (responseBody.result) {
          return responseBody.result;
        }
        return responseBody;
      }

      throw new Error(`Error ${response.status}`);
    }),
    retryWhen((errors) => errors.pipe(delayWhen(() => timer(5000))))
  );
};

export default fetchCandles$;
