import { describe, expect, it } from '@jest/globals';

import { TIME_INTERVAL } from '../constants/appConstants';

import { constructRSIStoringObject } from './talibUtils';
import { getStockList } from './utilFuntions';

describe('constructRSIStoringObject', () => {
  it('All params are valid', () => {
    const stockList = getStockList('testArray');
    if (!stockList) return;
    const input = [
      [
        [stockList[0], TIME_INTERVAL.Fifteen_Minute, 23.4],
        [stockList[0], TIME_INTERVAL.Four_Hour, 43.4],
        [stockList[0], TIME_INTERVAL.One_Day, 412],
      ],
      [
        [stockList[1], TIME_INTERVAL.Fifteen_Minute, 435],
        [stockList[1], TIME_INTERVAL.Four_Hour, 32.4],
        [stockList[1], TIME_INTERVAL.One_Day, 9340],
      ],
    ];
    const expectedResult = {
      [stockList[0]]: {
        [TIME_INTERVAL.Fifteen_Minute]: 23.4,
        [TIME_INTERVAL.Four_Hour]: 43.4,
        [TIME_INTERVAL.One_Day]: 412,
      },
      [stockList[1]]: {
        [TIME_INTERVAL.Fifteen_Minute]: 435,
        [TIME_INTERVAL.Four_Hour]: 32.4,
        [TIME_INTERVAL.One_Day]: 9340,
      },
    };
    const result = constructRSIStoringObject(input);
    console.log(result);
    expect(result).toEqual(expectedResult);
  });
});
