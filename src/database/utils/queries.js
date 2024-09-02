export const isDataAvailableForTheDateQuery = (instrumentalCode, checkingDate) => {
  return [
    {
      $match: {
        instrumentalCode,
      },
    },
    {
      $project: {
        matchedData: {
          $filter: {
            input: '$data',
            as: 'item',
            cond: {
              $eq: ['$$item.date', checkingDate],
            },
          },
        },
      },
    },
  ];
};

export const stockAttributeFlattenQuery = (instrumentalCode, attributeName, limit = 100000) => {
  const query = [
    {
      $match: {
        instrumentalCode,
      },
    },
    // Unwind the 'data' array to deconstruct it into individual documents
    { $unwind: '$data' },
    // Limit to the first 5 elements in the 'data' array
    { $limit: limit },
    // Project only the 'stockData.close' array field
    { $project: { attributeValues: `$data.stockData.${attributeName}` } },
    // Group all closing prices into a single array
    {
      $group: {
        _id: null,
        allAttributeValues: { $push: '$attributeValues' },
      },
    },
    {
      $addFields: {
        flattenedValues: {
          $reduce: {
            input: '$allAttributeValues',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] },
          },
        },
      },
    },
    // Project to reshape the output if needed
    {
      $project: {
        _id: 0,
        flattenedValues: 1,
      },
    },
  ];
  return query;
};

export const stockAttributeQuery = (instrumentalCode, attributeName, limit = 100000) => {
  const query = [
    {
      $match: {
        instrumentalCode,
      },
    },
    { $unwind: '$data' },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        date: '$data.date',
        attributeValues: `$data.stockData.${attributeName}`,
      },
    },
  ];
  return query;
};

export const completeStockDataQuery = (instrumentalCode, limit = 100000) => {
  const query = [
    {
      $match: {
        instrumentalCode,
      },
    },
    {
      $project: {
        data: {
          $slice: ['$data', limit],
        },
        _id: 0,
      },
    },
  ];
  return query;
};

export const rsiForAllQuery = (technicalIndicator) => {
  const ti = technicalIndicator.toLowerCase();
  const query = [
    {
      $project: {
        stockExchangeCode: 1,
        [technicalIndicator]: `$ta.${ti}`,
        _id: 0,
      },
    },
  ];
  return query;
};

export const instrumentalCodesQuery = () => {
  const query = [
    {
      $project: {
        stockExchangeCode: 1,
        instrumentalCode: 1,
        _id: 0,
      },
    },
  ];
  return query;
};

export const instrumentalCodeForSpecificStockQuery = (stockExchangeCode) => {
  const query = [
    {
      $match: {
        stockExchangeCode,
      },
    },
    {
      $project: {
        instrumentalCode: 1,
        _id: 0,
      },
    },
  ];
  return query;
};

export const coreDataQuery = () => {
  const query = [
    {
      $project: {
        _id: 0,
        stockExchangeCode: 1,
        companyName: 1,
        lastTradedPrice: 1,
      },
    },
  ];
  return query;
};

export const candlestickPattternsQuery = () => {
  const query = [
    {
      $project: {
        _id: 0,
        stockExchangeCode: 1,
        candlestickPattterns: 1,
      },
    },
  ];
  return query;
};
