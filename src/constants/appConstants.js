export const TIME_INTERVAL = {
  One_Minute: '1minute',
  Five_Minute: '5minute',
  Ten_Minute: '10minute',
  Fifteen_Minute: '15minute',
  Thirty_Minute: '30minute',
  One_Day: '1day',
};

export const EXCHANGE_CODE = {
  NSE: 'NSE',
  BSE: 'BSE',
  NFO: 'NFO',
};

export const OPERATOR_NAME = {
  max: 'MAX',
  min: 'MIN',
};

export const FLAT_GAP = {
  One_Minute: 1,
  Five_Minute: 5,
  Ten_Minute: 10,
  Fifteen_Minute: 15,
  Thirty_Minute: 30,
  One_Day: 375,
};

export const INDEXES = {
  nify500: 'nifty500',
  nifty250: 'nifty250',
};

export const DATA_ATTRIBUTES = {
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  volume: 'volume',
  datetime: 'datetime',
};

export const PRICE_ELEMENTS_PER_DAY_IN_DB = 75; // 5 minute candles

export const ERROR_MESSAGE = {
  unknownStockCode: 'Please correct the stock exchange code',
  unknowDataAttribute: 'Please choose the data attributes from [open, close, high, low, datetime, volume]',
  unknownStockList: 'Please choose the category from [nifty500]',
  mongoDBFetchingErrpr: 'Error while finding the doc in history data collection',
  documentNotFound: 'Document not found in collection',
  dataAvaiableForTheDate: 'Data has been already inserted for this date',
  documentInsertSuccess: 'Successfully document updated',
  documentUpdateError: 'Error updating document',
};
