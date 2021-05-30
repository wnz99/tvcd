const makeCustomApiUrl = (rootUrl: string, isUdf?: boolean): string =>
  isUdf ? `${rootUrl}/bitmex/api/udf` : `${rootUrl}/bitmex/api/v1`;

export default makeCustomApiUrl;
