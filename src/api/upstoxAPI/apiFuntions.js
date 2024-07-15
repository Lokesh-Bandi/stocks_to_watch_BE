import axios from 'axios';

import { TIME_INTERVAL } from '../../constants/appConstants.js';
import {
  getCurrentDate,
  getFlattenData,
  getFlattenDataToInterval,
  getLastNDaysBackDate,
  getLastNDaysHistoricalData,
} from '../../utils/utilFuntions.js';

// https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=32d26030-0f60-4a6f-b58d-94fe62bc869f&redirect_uri=http://localhost:3000

export const getAccessToken = async (authorizationCode) => {
  try {
    const response = await axios.post(
      'https://api.upstox.com/index/oauth/token',
      {
        code: authorizationCode,
        client_id: 'YOUR_API_KEY',
        client_secret: 'YOUR_API_SECRET',
        redirect_uri: 'YOUR_REDIRECT_URI',
        grant_type: 'authorization_code',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    // console.error('Error fetching access token:', error.response ? error.response.data : error.message);
    return null;
  }
};

export const getHistoricalData = async (stockCode, apiInstance, interval, days) => {
  const toDate = getCurrentDate();
  const fromDate = getLastNDaysBackDate(toDate, days + 25);
  const apiVersion = '2.0';
  console.log(stockCode);
  try {
    const historicalData = await new Promise((resolve, reject) => {
      apiInstance.getHistoricalCandleData1(stockCode, interval, toDate, fromDate, apiVersion, (error, data) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(data.data.candles); // Resolve with the candles data
        }
      });
    }).then((res) => {
      return res;
    });
    const lastNDaysHistoricalData = getLastNDaysHistoricalData(historicalData, days);
    const flattenData = getFlattenData(lastNDaysHistoricalData);
    const flattenDataToInterval = getFlattenDataToInterval(flattenData, TIME_INTERVAL.Five_Minute);
    return flattenDataToInterval;
  } catch (e) {
    console.log(e);
    return [];
  }
};
