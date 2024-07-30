import UpstoxClient from 'upstox-js-sdk';

import { getTodayData } from '../api/upstoxAPI/apiFuntions.js';
import { ApiStatus, ERROR_MESSAGE, TIME_INTERVAL } from '../constants/appConstants.js';
import { isDataAvailableForThisDate } from '../database/utils/dbHelper.js';
import { DB_STATUS } from '../models/modelUtils.js';
import { insertTodayData } from '../models/todaysDataModel.js';
import ApiRateLimiter from '../services/APILimitService.js';
import { getCurrentDate, getInstrumentalCode, getStockList } from '../utils/utilFuntions.js';

const todaysDataController = {
  fetchGroupTodayData: async (req, res) => {
    try {
      const { grp: category } = req.params;
      const stockList = getStockList(category);

      if (!stockList) {
        res.send(ERROR_MESSAGE.unknownStockList);
        return;
      }

      const upstoxApiInstance = await new UpstoxClient.HistoryApi();

      const executeAPI = async (apiInstance, currentRunningCount) => {
        const stockCode = getInstrumentalCode(stockList[currentRunningCount]);
        console.log(stockCode);
        const isDataAvailable = await isDataAvailableForThisDate(stockList[currentRunningCount], getCurrentDate());
        if (isDataAvailable) {
          return {
            stockExchangeCode: stockList[currentRunningCount],
            api: {
              status: ApiStatus.error,
              ack: ERROR_MESSAGE.dataAvaiableForTheDate,
            },
            db: {
              status: DB_STATUS.error,
              ack: ERROR_MESSAGE.dataAvaiableForTheDate,
            },
          };
        }
        const { status: apiStatus, data: todayData } = await getTodayData(stockCode, apiInstance, TIME_INTERVAL.One_Minute);

        const { status: dbStatus, ack } = await insertTodayData(stockList[currentRunningCount], todayData);
        return {
          stockExchangeCode: stockList[currentRunningCount],
          api: {
            status: apiStatus,
            ack: todayData,
          },
          db: {
            status: dbStatus,
            ack,
          },
        };
      };

      const apiRateLimiterInstance = new ApiRateLimiter(
        upstoxApiInstance,
        executeAPI,
        { maxCallsPerHour: 1000, maxCallsPerMinute: 250, maxCallsPerSecond: 25 },
        stockList.length
      );

      const { data: rateLimiterResult, message: rateLimiterMessage } = await apiRateLimiterInstance.startRateLimiter();

      const stocksStatus = rateLimiterResult.reduce(
        (acc, stockDataStatus) => {
          const { stockExchangeCode, api, db } = stockDataStatus;
          console.log(stockDataStatus);
          if (api.status === ApiStatus.success) {
            acc.apiSuccessArray.push(stockExchangeCode);
          } else {
            acc.apiErrorArray.push(stockExchangeCode);
            acc.APIErrors.push({ stockExchangeCode, apiError: api.ack });
          }

          if (db.status === DB_STATUS.created) {
            acc.DBCreatedArray.push(stockExchangeCode);
          } else if (db.status === DB_STATUS.updated) {
            acc.DBUpdatedArray.push(stockExchangeCode);
          } else {
            acc.DBErrorArray.push(stockExchangeCode);
            acc.DBErrors.push({ stockExchangeCode, dbError: db.ack });
          }
          return acc;
        },
        {
          apiSuccessArray: [],
          apiErrorArray: [],
          DBCreatedArray: [],
          DBUpdatedArray: [],
          DBErrorArray: [],
          APIErrors: [],
          DBErrors: [],
        }
      );

      res.json({
        ...stocksStatus,
        message: `Data save sucessfully -- ${rateLimiterMessage}`,
      });
    } catch (e) {
      res.json({
        message: `Error ocurred : ${e}`,
      });
    }
  },
  fetchTodayData: async (req, res) => {
    const { stockExchangeCode } = req.params;
    const stockCode = stockExchangeCode.toUpperCase();
    const instrumentalCode = getInstrumentalCode(stockCode);

    if (!instrumentalCode) {
      res.send(ERROR_MESSAGE.unknownStockCode);
    }
    const apiInstance = await new UpstoxClient.HistoryApi();
    const { status: apiStatus, data: todayData } = await getTodayData(instrumentalCode, apiInstance, TIME_INTERVAL.One_Minute);
    if (todayData.length === 0) return null;
    if (await isDataAvailableForThisDate(stockExchangeCode, todayData[0]?.date)) {
      return res.json({
        stockExchangeCode,
        api: {
          status: apiStatus,
          ack: todayData,
        },
        db: {
          status: DB_STATUS.error,
          ack: ERROR_MESSAGE.dataAvaiableForTheDate,
        },
      });
    }

    const { status: dbStatus, ack } = await insertTodayData(stockExchangeCode, todayData);
    res.json({
      stockExchangeCode,
      api: {
        status: apiStatus,
        ack: todayData,
      },
      db: {
        status: dbStatus,
        ack,
      },
    });
  },
};

export default todaysDataController;
