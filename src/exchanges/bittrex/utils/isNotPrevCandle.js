import moment from 'moment';

const isNotPastCandle = (availableDataForThePeriod, streamData) => {
  const channel = `${streamData[2]}:${streamData[0]}`;

  if (
    availableDataForThePeriod[channel] &&
    moment(streamData[1].T).valueOf() > availableDataForThePeriod[channel].end
  ) {
    return true;
  }
  return false;
};

export default isNotPastCandle;
