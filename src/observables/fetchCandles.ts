import { timer, defer, Observable } from 'rxjs';
import { delayWhen, retryWhen, switchMap, map } from 'rxjs/operators';
import axios, { AxiosRequestConfig } from 'axios';

export const fetchCandles$ = <T>(
  restApiUrl: string,
  requestOptions?: AxiosRequestConfig
): Observable<T> =>
  defer(() => axios.get(restApiUrl, requestOptions)).pipe(
    switchMap(async (response) => {
      if (response.status === 200) {
        if (response.data.data) {
          return response.data.data;
        }

        if (response.data.result) {
          return response.data.result;
        }

        if (response.data) {
          return response.data;
        }
      }

      throw new Error(`Error ${response.status}`);
    }),
    retryWhen((errors) =>
      errors.pipe(
        map((err, i) => {
          if (i > 2) {
            throw err;
          }

          return err;
        }),
        delayWhen(() => timer(5000))
      )
    )
  );

export default fetchCandles$;
