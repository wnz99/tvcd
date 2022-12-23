import { BigNumber } from 'bignumber.js'

// A function to calculate the maximum value in an array

export const max = (arr: number[]) => Math.max(...arr)
// A function to calculate the minimum value in an array

export const min = (arr: number[]) => Math.min(...arr)
// A function to sum the values in an array

export const sum = (arr: number[]) =>
  arr.reduce((a, b) => new BigNumber(a).plus(b), new BigNumber(0)).toNumber()
// A function to return last value in an array

export const last = (arr: number[]) => arr[arr.length - 1]
// A function to return first value in an array

export const first = (arr: number[]) => arr[0]
