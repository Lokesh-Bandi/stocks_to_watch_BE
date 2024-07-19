import { describe, expect, it } from '@jest/globals';

import { DATA_ATTRIBUTES, TIME_INTERVAL } from '../constants/appConstants';

import { sampeArrayOf50Size, sampleDateWiseData, sampleDateWiseDataInterval10Mins, sampleDateWiseDataInterval30Mins } from './testConstants.test';
import { constructIntervalDataFromArray, getValidAttributeValueFromIntervalData, splitArrayIntoSpecifiedIntervals } from './utilFuntions';

describe('getValidAttributeValueFromIntervalData', () => {
  it('Datetime', () => {
    const datetimeArray = [
      '2024-07-16T15:25:00+05:30',
      '2024-07-16T15:20:00+05:30',
      '2024-07-16T15:15:00+05:30',
      '2024-07-16T15:10:00+05:30',
      '2024-07-16T15:05:00+05:30',
    ];
    const result = getValidAttributeValueFromIntervalData(datetimeArray, DATA_ATTRIBUTES.datetime);
    expect(result).toBe('2024-07-16T15:05:00+05:30');
  });
  it('Open prices', () => {
    const open = [623.25, 620.1, 617.8, 617.75, 616.45];
    const result = getValidAttributeValueFromIntervalData(open, DATA_ATTRIBUTES.open);
    expect(result).toBe(616.45);
  });
  it('Close prices', () => {
    const close = [623.25, 620.1, 617.8, 617.75, 616.45];
    const result = getValidAttributeValueFromIntervalData(close, DATA_ATTRIBUTES.close);
    expect(result).toBe(623.25);
  });
  it('High prices', () => {
    const high = [623.25, 620.1, 677.8, 617.75, 616.45];
    const result = getValidAttributeValueFromIntervalData(high, DATA_ATTRIBUTES.high);
    expect(result).toBe(677.8);
  });
  it('Low prices', () => {
    const low = [623.25, 620.1, 617.8, 617.75, 616.45];
    const result = getValidAttributeValueFromIntervalData(low, DATA_ATTRIBUTES.low);
    expect(result).toBe(616.45);
  });
  it('Volume', () => {
    const volume = [1220, 6201, 6178, 6775, 6145];
    const result = getValidAttributeValueFromIntervalData(volume, DATA_ATTRIBUTES.volume);
    expect(result).toBe(26519);
  });
  it('Unknown data attribute', () => {
    const arr = [1220, 6201, 6178, 6775, 6145];
    const result = getValidAttributeValueFromIntervalData(arr, 'sample');
    expect(result).toBe(null);
  });
  it('Empty interval array', () => {
    const volume = [];
    const result = getValidAttributeValueFromIntervalData(volume, DATA_ATTRIBUTES.volume);
    expect(result).toBe(null);
  });
  it('If interval array is not an array', () => {
    const volume = 12;
    const result = getValidAttributeValueFromIntervalData(volume, DATA_ATTRIBUTES.volume);
    expect(result).toBe(null);
  });
  it('Missing data attribute', () => {
    const volume = [1220, 6201, 6178, 6775, 6145];
    const result = getValidAttributeValueFromIntervalData(volume);
    expect(result).toBe(null);
  });
  it('Missing interval array and Empty data attribute', () => {
    const result = getValidAttributeValueFromIntervalData();
    expect(result).toBe(null);
  });
});

describe('splitArrayIntoSpecifiedIntervals', () => {
  it('Passing valid array and interval = 5 mins (1)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Five_Minute);
    expect(result).toStrictEqual(sampeArrayOf50Size);
  });
  it('Passing valid array and interval = 10 mins (2)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Ten_Minute);
    const expectedResult = [
      [23, 56],
      [11, 78],
      [34, 90],
      [17, 42],
      [65, 88],
      [5, 30],
      [71, 48],
      [19, 53],
      [82, 14],
      [37, 69],
      [92, 25],
      [63, 10],
      [87, 41],
      [76, 28],
      [50, 94],
      [9, 67],
      [32, 81],
      [46, 13],
      [58, 85],
      [21, 74],
      [39, 72],
      [4, 61],
      [16, 83],
      [36, 79],
      [52, 95],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('Passing valid array and interval = 15 mins (3)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Fifteen_Minute);
    const expectedResult = [
      [23, 56],
      [11, 78, 34],
      [90, 17, 42],
      [65, 88, 5],
      [30, 71, 48],
      [19, 53, 82],
      [14, 37, 69],
      [92, 25, 63],
      [10, 87, 41],
      [76, 28, 50],
      [94, 9, 67],
      [32, 81, 46],
      [13, 58, 85],
      [21, 74, 39],
      [72, 4, 61],
      [16, 83, 36],
      [79, 52, 95],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('Passing valid array and interval = 30 mins (6)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Thirty_Minute);
    const expectedResult = [
      [23, 56],
      [11, 78, 34, 90, 17, 42],
      [65, 88, 5, 30, 71, 48],
      [19, 53, 82, 14, 37, 69],
      [92, 25, 63, 10, 87, 41],
      [76, 28, 50, 94, 9, 67],
      [32, 81, 46, 13, 58, 85],
      [21, 74, 39, 72, 4, 61],
      [16, 83, 36, 79, 52, 95],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('Passing valid array and interval = 4 hrs (48)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Four_Hour);
    const expectedResult = [
      [23, 56],
      [
        11, 78, 34, 90, 17, 42, 65, 88, 5, 30, 71, 48, 19, 53, 82, 14, 37, 69, 92, 25, 63, 10, 87, 41, 76, 28, 50, 94, 9, 67, 32, 81, 46, 13, 58, 85,
        21, 74, 39, 72, 4, 61, 16, 83, 36, 79, 52, 95,
      ],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('Passing valid array and interval = 1 day (75)', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.One_Day);
    const expectedResult = [
      [
        23, 56, 11, 78, 34, 90, 17, 42, 65, 88, 5, 30, 71, 48, 19, 53, 82, 14, 37, 69, 92, 25, 63, 10, 87, 41, 76, 28, 50, 94, 9, 67, 32, 81, 46, 13,
        58, 85, 21, 74, 39, 72, 4, 61, 16, 83, 36, 79, 52, 95,
      ],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('If the array is unable to split into equals', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, TIME_INTERVAL.Fifteen_Minute);
    const expectedResult = [
      [23, 56],
      [11, 78, 34],
      [90, 17, 42],
      [65, 88, 5],
      [30, 71, 48],
      [19, 53, 82],
      [14, 37, 69],
      [92, 25, 63],
      [10, 87, 41],
      [76, 28, 50],
      [94, 9, 67],
      [32, 81, 46],
      [13, 58, 85],
      [21, 74, 39],
      [72, 4, 61],
      [16, 83, 36],
      [79, 52, 95],
    ];
    expect(result).toStrictEqual(expectedResult);
  });
  it('Empty interval array', () => {
    const result = splitArrayIntoSpecifiedIntervals([], TIME_INTERVAL.Five_Minute);
    expect(result).toBe(null);
  });
  it('Unknown interval value', () => {
    const result = splitArrayIntoSpecifiedIntervals(sampeArrayOf50Size, 8);
    expect(result).toStrictEqual(sampeArrayOf50Size);
  });
  it('Both params are missing ', () => {
    const result = splitArrayIntoSpecifiedIntervals();
    expect(result).toBe(null);
  });
});

describe('constructIntervalDataFromArray', () => {
  it('valid datewiseArray and valid interval = 5 mins', () => {
    const result = constructIntervalDataFromArray(sampleDateWiseData, TIME_INTERVAL.Five_Minute);
    expect(result).toStrictEqual(sampleDateWiseData);
  });
  it('valid datewiseArray and valid interval = 10 mins', () => {
    const result = constructIntervalDataFromArray(sampleDateWiseData, TIME_INTERVAL.Ten_Minute);
    expect(result).toStrictEqual(sampleDateWiseDataInterval10Mins);
  });
  it('valid datewiseArray and valid interval = 10 mins', () => {
    const result = constructIntervalDataFromArray(sampleDateWiseData, TIME_INTERVAL.Thirty_Minute);
    expect(result).toStrictEqual(sampleDateWiseDataInterval30Mins);
  });
});
