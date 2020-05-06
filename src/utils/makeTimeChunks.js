const makeTimeChunks = (start, end, chunkSize) => {
  const startTime = start;
  const chunks = [];
  const endTime = end;

  for (let i = startTime - 1; i < endTime; i += chunkSize) {
    const fromTime = i + 1;
    const toTime = i + chunkSize > endTime ? end : i + chunkSize;
    chunks.push({ fromTime, toTime });
  }
  return chunks;
};

export default makeTimeChunks;
