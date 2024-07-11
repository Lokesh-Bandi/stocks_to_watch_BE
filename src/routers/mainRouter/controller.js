import {
  getHistoricalData,
  getTodaysData,
} from '../../api/breezeAPI/apiFuntions.js';
import { SESSION_KEY } from '../../api/breezeAPI/keys.js';
import { TIME_INTERVAL } from '../../constants/appConstants.js';
import { STOCK_SYMBOLS } from '../../constants/constants.js';
import {
  insertDBWithLast30DatysData,
  updateDBWithTodaysData,
} from '../../database/modalFuns.js';
import { Sample } from '../../database/schemas.js';
import ApiRateLimiter from '../../services/APILimitService.js';
import {
  constructStructuredData,
  filterData,
  getISecStockCode,
  getLast30DaysHistoricalData,
} from '../../utils/utilFuntions.js';

import modal from './modal.js';

const controller = {
  fetchDataTest: async (req, res) => {
    console.log('Main Router');
    try {
      const data = await modal.getJsonData();
      res.send(data);
    } catch (error) {
      res.status(404);
    }
  },
  fetchHistoricalData: async (req, res) => {
    console.log('Main Router --- Historical Data', STOCK_SYMBOLS[0]);
    try {
      const data = await globalThis.breezeInstance.getHistoricalData({
        interval: '1day', // '1minute', '5minute', '30minute','1day'
        fromDate: '2024-06-21T07:00:00.000Z',
        toDate: '2024-06-25T07:00:00.000Z',
        stockCode: STOCK_SYMBOLS[0],
        exchangeCode: 'NSE', // 'NSE','BSE','NFO'
        productType: 'cash',
      });
      res.send(data);
    } catch (error) {
      res.send('Error in acessing ');
      res.status(404);
    }
  },
  fetchStockCodes: async (req, res) => {
    const allStockCodes = {};
    const executorCallback = () => {
      const stockSymbols = STOCK_SYMBOLS;

      const getStockCode = async (currentApiCallcount) => {
        console.log(currentApiCallcount);
        const code = await globalThis.breezeInstance.getNames({
          exchangeCode: 'NSE',
          stockCode: stockSymbols[currentApiCallcount],
        });
        console.log(code);
        allStockCodes[stockSymbols[currentApiCallcount]] = code;
      };
      return getStockCode;
    };

    const executeAPI = executorCallback();
    const manualStopCount = 2379;

    const apiRateLimiterInstance = new ApiRateLimiter(
      executeAPI,
      manualStopCount,
      {
        maxCallsPerMinute: 100,
        maxCallsPerDay: 5000,
      }
    );
    apiRateLimiterInstance.startRateLimiter();

    const timeToPrint = 1000 * 60 * 24;
    setTimeout(() => {
      console.log(allStockCodes);
      res.send(allStockCodes);
    }, timeToPrint);
  },
  fetchCustomerDetails: async () => {
    await globalThis.breezeInstance
      .getCustomerDetails(SESSION_KEY)
      .then((data) => {
        console.log(data);
        globalThis.customerData = data.Success;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  fetchOneClickFO: async () => {
    // Callback to receive ticks.
    function onTicks(ticks) {
      console.log(ticks);
    }
    // Assign the callbacks
    await globalThis.breezeInstance.wsConnect();
    globalThis.breezeInstance.onTicks = onTicks;
    globalThis.breezeInstance
      .subscribeFeeds({ stockToken: 'one_click_fno' })
      .then((resp) => {
        console.log('Response : ', resp);
      });
  },
  fetchStockLiveFeed: async () => {
    // Callback to receive ticks.
    function onTicks(ticks) {
      console.log(ticks);
    }
    // Assign the callbacks
    await globalThis.breezeInstance.wsConnect();
    globalThis.breezeInstance.onTicks = onTicks;
    globalThis.breezeInstance
      .subscribeFeeds({ stockToken: '4.1!1594' })
      .then((resp) => {
        console.log('Response : ', resp);
      });
  },

  fetchLast30DaysStockData: async (
    stockExchangeCode,
    interval = TIME_INTERVAL.Five_Minute
  ) => {
    const iSecStockCode = getISecStockCode(stockExchangeCode);
    const historicalData = await getHistoricalData(iSecStockCode, interval);
    const filteredData = filterData(historicalData);
    const last30DaysHistoricalData = getLast30DaysHistoricalData(filteredData);

    console.log(last30DaysHistoricalData.length);

    const structuredData = constructStructuredData(last30DaysHistoricalData);

    await insertDBWithLast30DatysData(stockExchangeCode, structuredData);

    return structuredData;
  },

  fetchTodaysData: async (
    stockExchangeCode,
    interval = TIME_INTERVAL.Five_Minute
  ) => {
    const todayData = await getTodaysData(stockExchangeCode, interval);
    const filteredData = filterData(todayData);
    const structuredData = constructStructuredData(filteredData);
    await updateDBWithTodaysData(stockExchangeCode, { structuredData });
    return structuredData;
  },
  test: async () => {
    const findAndUpdate = async (stockCode, updateList) => {
      try {
        // Find the document by the specified field
        const doc = await Sample.findOne({
          name: 'qwe',
        });
        if (!doc) {
          console.error('Document not found');
          return;
        }

        // Remove the first 5 elements from the array
        doc.items = doc.items.slice(5);

        // Add the new elements to the end of the array
        doc.items.push(...updateList);

        // Save the updated document
        await doc.save();

        console.log('Successfully updated document:', doc);
      } catch (err) {
        console.error('Error updating document:', err);
      }
    };
    findAndUpdate('', [3, 4, 5]);
  },
};
export default controller;
