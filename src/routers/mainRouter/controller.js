import { STOCK_SYMBOLS } from '../../constants/constants.js';
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
      const data = await globalThis.breezeInstance.getHistoricalData(
        {
            interval:"1day",   //'1minute', '5minute', '30minute','1day'
            fromDate: "2024-06-21T07:00:00.000Z",
            toDate: "2024-06-25T07:00:00.000Z",
            stockCode: STOCK_SYMBOLS[0],
            exchangeCode:"NSE",   // 'NSE','BSE','NFO'
            productType:"cash"
        }
    );
      res.send(data);
    } catch (error) {
      res.send('Error in acessing ');
      res.status(404);
    }
  },
  fetchStockCodes: async (req, res) => {
    try {
      const code = await globalThis.breezeInstance.getNames({exchangeCode :'NSE',stockCode : 'ICICIBANK'});
      console.log(code);
      res.send(code)
    } catch(e) {

    }
  }
};

export default controller;
