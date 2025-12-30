
export function MA(data[], period) {
  return data.map((_, i) =>
    i < period ? null .slice(i - period, i).reduce((a, b) => a + b) / period
  );
}
