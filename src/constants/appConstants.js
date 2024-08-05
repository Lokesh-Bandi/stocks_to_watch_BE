export const TIME_INTERVAL = {
  One_Minute: '1minute',
  Five_Minute: '5minute',
  Ten_Minute: '10minute',
  Fifteen_Minute: '15minute',
  Thirty_Minute: '30minute',
  Four_Hour: '4hour',
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
  Five_Minute: 1,
  Ten_Minute: 2,
  Fifteen_Minute: 3,
  Thirty_Minute: 6,
  Four_Hour: 48,
  One_Day: 75,
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
  unknownInstrumentalCode: 'Please correct the instrumental code',
  unknownStockCode: 'Please correct the stock exchange code',
  unknowDataAttribute: 'Please choose the data attributes from [open, close, high, low, datetime, volume]',
  unknownStockList: 'Please choose the category from [nifty500]',
  mongoDBFetchingErrpr: 'Error while finding the doc in history data collection',
  documentNotFound: 'Document not found in collection',
  dataAvaiableForTheDate: 'Data has been already inserted for this date',
  documentInsertSuccess: 'Successfully document updated',
  documentUpdateError: 'Error updating document',
  unknownTechIndicator: 'Unknown technical indicator',
  noInstrumentalCodes: 'Missing instrumental codes object',
  missingNoOfDays: 'Missing days param in url',
  dbNotYetReached: 'Not yet reached the DB',
  controllerError: 'Error in controller code',
  errorinKeyStocks: 'Error updating key stocks in DB',
  errorInAllTechInd: 'Error updating all technical indicator values',
};

export const MAX_DAYS_DATA = 50;

export const TECHNICAL_INDICATORS = {
  rsi: 'rsi',
  mfi: 'mfi',
  obv: 'obv',
  bollingerbands: 'bollingerbands',
};

export const TECHNICAL_INDICATORS_ARR = Object.values(TECHNICAL_INDICATORS);

export const TECH_INDICATOR_TIME_INTERVALS = [TIME_INTERVAL.Fifteen_Minute, TIME_INTERVAL.Four_Hour, TIME_INTERVAL.One_Day];

export const ApiStatus = {
  success: 'success',
  error: 'error',
};

export const DB_STATUS = {
  created: 'created',
  updated: 'updated',
  error: 'error',
};

export const bulkUpdateKeys = {
  insertedCount: 'insertedCount',
  matchedCount: 'matchedCount',
  modifiedCount: 'modifiedCount',
  deletedCount: 'deletedCount',
  upsertedCount: 'upsertedCount',
  upsertedIds: 'upsertedIds',
  insertedIds: 'insertedIds',
};

export const RSI_KEYS = {
  lessthan30: 'lessthan30',
  morethan70: 'morethan70',
  nearTo30: 'nearTo30',
  nearTo70: 'nearTo70',
};

export const MFI_KEYS = {
  lessthan20: 'lessthan20',
  morethan80: 'morethan80',
  nearTo20: 'nearTo20',
  nearTo80: 'nearTo80',
};

export const BOLLINGERBANDS_KEYS = {
  lessthan0: 'lessthan0',
  morethan1: 'morethan1',
  nearTo0D1: 'nearTo0D1',
  nearTo0D9: 'nearTo0D9',
};
