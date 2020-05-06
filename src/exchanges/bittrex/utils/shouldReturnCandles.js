const shouldReturnCandles = (end, availableDataForThePeriod) => {
  if (!availableDataForThePeriod) {
    return true;
  }

  if (end >= availableDataForThePeriod.end) {
    return true;
  }

  if (end <= availableDataForThePeriod.start) {
    return false;
  }

  return false;
};

export default shouldReturnCandles;
