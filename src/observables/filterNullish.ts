import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs'
import { filter } from 'rxjs/operators'

const filterNullish = <T>(): UnaryFunction<
  Observable<T | undefined>,
  Observable<T>
> => pipe(filter((x) => !!x) as OperatorFunction<T | undefined, T>)

export default filterNullish
