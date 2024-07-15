export const ROUTES = {
  login: 'login',
  signUp: 'signUp',
  historicalData: 'historicalData',
  today: 'today',
  test: 'test',
};

export const SUB_ROUTES = {
  today: {
    singleStockData: '/:stockExchangeCode',
    all: '/all/:grp',
    customData: '/:stockExchangeCode/:customParam',
  },
  history: {
    singleStockData: '/:stockExchangeCode',
    all: '/all/:grp/:days',
  },
};
