import Fetcher from '../../api/Fetcher.js';

const modal = {
  getJsonData: async () => {
    try {
      const fetchedData = await Fetcher.get('https://jsonplaceholder.typicode.com/posts');
      console.log(fetchedData);
      return fetchedData;
    } catch (err) {
      return null;
    }
  },
};

export default modal;
