import { timer, defer, Observable } from 'rxjs';
import { delayWhen, retryWhen, switchMap } from 'rxjs/operators';

export const fetchCandles$ = <T>(
  restApiUrl: string,
  requestOptions?: { [key: string]: string | number }
): Observable<T> =>
  defer(() => fetch(restApiUrl, requestOptions)).pipe(
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

export default fetchCandles$;
