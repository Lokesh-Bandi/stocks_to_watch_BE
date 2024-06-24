import Fetcher from '../../api/Fetcher.js';
import { getBreezeRequestConfig } from '../../api/utils.js';

const modal = {
  getJsonData: async () => {
    try {
      // const fetchedData = await Fetcher.get(
      //   'https://jsonplaceholder.typicode.com/posts'
      // );
      const fetchedData = await Fetcher.get(
        'https://jsonplaceholder.typicode.com/posts'
      );
      console.log(fetchedData)
      return fetchedData;
    } catch (err) {
      return null;
    }
  },
  getHistoricalData: async () => {
    const data = {
      interval: 'day',
      from_date: '2022-05-02T07:00:00.000Z',
      to_date: '2022-05-03T07:00:00.000Z',
      stock_code: 'ITC',
      exchange_code: 'NSE',
      product_type: 'Cash',
    };
    try {
      const fetchedData = await Fetcher.get(
        'https://api.icicidirect.com/breezeapi/api/v1/historicalcharts',
        '',
        getBreezeRequestConfig(data)
      );
      return fetchedData;
    } catch (err) {
      return null;
    }
  },
};

export default modal;
