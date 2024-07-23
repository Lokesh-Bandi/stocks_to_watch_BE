/**
 * Object with key as a TIME_INTERVAL value with corresponding techincal indicator value.
 * @typedef {Object.<string, number>} TechIndicatorIntervalValuesArray
 */

/**
 * Technical indicator response
 * @typedef {Array} TechIndicatorResponse
 * @property {string} 0 - stockExchangeCode
 * @property {string} 1 - interval
 * @property {string} 1 - technical indicator value
 */

/**
 * Function to construct an RSI object with key as a stockExhangeCode and value as a corresponding rsi interval values.
 * @param {Array<Array<TechIndicatorResponse>>} arrayOfTechIndicatorResponse
 * @returns {Object.<string, TechIndicatorIntervalValuesArray>} - returns an object with key as a stockExchangeCode and value as a interval object with respective rsi values
 */
export const constructRSIStoringObject = (arrayOfTechIndicatorResponse) => {
  if (!Array.isArray(arrayOfTechIndicatorResponse) || arrayOfTechIndicatorResponse.length === 0) return null;
  let returnObj = {};
  arrayOfTechIndicatorResponse.forEach((stockIntervalRSIValues) => {
    stockIntervalRSIValues.forEach((eachIntervalStockData) => {
      const [stockExchangeCode, interval, rsi] = eachIntervalStockData;
      returnObj = {
        ...returnObj,
        [stockExchangeCode]: {
          ...returnObj[stockExchangeCode],
          [interval]: rsi,
        },
      };
    });
  });

  return returnObj;
};
