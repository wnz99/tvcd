import { filter } from 'rxjs/operators';
import { UnaryFunction, pipe, Observable, OperatorFunction } from 'rxjs';

const filterNullish = <T>(): UnaryFunction<
  Observable<T | undefined>,
  Observable<T>
> => pipe(filter((x) => !!x) as OperatorFunction<T | undefined, T>);

export default filterNullish;
