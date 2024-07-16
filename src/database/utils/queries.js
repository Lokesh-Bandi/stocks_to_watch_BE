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
