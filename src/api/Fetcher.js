import axios, { isAxiosError } from 'axios';

import { consoleError } from '../Error/consoleError.js';
import ErrorTypes from '../Error/types.js';

class FetcherRoot {
  static instance;

  static cache = {};

  SUCCESS_STATUS_CODE = 200;

  SUCCESS_STATUS_CODE_POST = 201;

  static getInstance() {
    if (!this.instance) {
      this.instance = new FetcherRoot();
    }
    return this.instance;
  }

  static getEndpoint(url) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split('?')[0];
    }
  }

  async get(url, baseUrl = null, params = null) {
    let originalUrl = url;
    if (baseUrl) {
      originalUrl = baseUrl + originalUrl;
    }
    const fetchedData = await axios
      .get(originalUrl, params)
      .then((response) => {
        const endPoint = FetcherRoot.getEndpoint(originalUrl);
        const { status } = response;
        const { statusText } = response;
        const { data } = response;
        if (status !== this.SUCCESS_STATUS_CODE) {
          throw new Error(
            `⚠ Error ${status}: ${statusText} while fetching ${endPoint}`
          );
        }
        return data;
      })
      .catch((e) => {
        const endPoint = FetcherRoot.getEndpoint(originalUrl);
        const errorMessage = `${e.message} while fetching ${endPoint}`;
        if (isAxiosError(e)) {
          consoleError(ErrorTypes.axios, e.code, errorMessage);
        } else {
          consoleError(ErrorTypes.fetch, undefined, errorMessage);
        }
      });
    return fetchedData;
  }

  post(url, data = undefined, baseUrl = undefined, config = null) {
    let originalUrl = url;
    if (baseUrl) {
      originalUrl = baseUrl + originalUrl;
    }
    const postResponse = axios
      .post(originalUrl, data, config)
      .then((response) => {
        const endPoint = FetcherRoot.getEndpoint(originalUrl);
        const { status } = response;
        const { statusText } = response;
        if (status !== this.SUCCESS_STATUS_CODE_POST) {
          throw new Error(
            `⚠ Error ${status}: ${statusText} while posting ${endPoint}`
          );
        }
        return response.data;
      })
      .catch((e) => {
        const endPoint = FetcherRoot.getEndpoint(originalUrl);
        const errorMessage = `${e.message} while posting ${endPoint}`;
        if (isAxiosError(e)) {
          consoleError(ErrorTypes.axios, e.code, errorMessage);
        } else {
          consoleError(ErrorTypes.fetch, undefined, errorMessage);
        }
      });
    return postResponse;
  }
}
const Fetcher = FetcherRoot.getInstance();

export default Fetcher;
