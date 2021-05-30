import { Options, Formatter, Candle } from '../types/exchanges';

const makeOptions = <T>(
  opts: Options,
  formatter: Formatter<T>
): { format: (data: T) => Candle } => {
  const format = formatter[opts.format]
    ? formatter[opts.format]
    : formatter.default;

  return { ...opts, format };
};

export default makeOptions;
