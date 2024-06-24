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
    console.log('Main Router --- Historical Data');
    try {
      const data = await modal.getHistoricalData();
      res.send(data);
    } catch (error) {
      res.send('Error in acessing ');
      res.status(404);
    }
  },
};

export default controller;
