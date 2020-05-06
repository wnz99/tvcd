import formatter from './formatter';

const makeOptions = (opts) => {
  const format = formatter[opts.format]
    ? formatter[opts.format]
    : formatter.default;
  return { ...opts, format };
};

export default makeOptions;
