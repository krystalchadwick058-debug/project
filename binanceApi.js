
import { mockKlines } from "../utils/mockData";

export async function getKlines() {
  return mockKlines;
}

export async function getTicker() {
  return { price: mockKlines[mockKlines.length - 1][4] };
}
