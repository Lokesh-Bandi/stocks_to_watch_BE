import { DB_STATUS } from '../constants/appConstants.js';
import { InstrumentalCodeModel } from '../database/schemas/InstrumentalCodeSchema.js';

export const coreUpdateAllInstrumentalCodes = async (stockExchangeCode, instrumentalCode) => {
  const updateStatus = await InstrumentalCodeModel.updateOne(
    { stockExchangeCode },
    {
      stockExchangeCode,
      instrumentalCode,
    },
    { upsert: true } // Create a new document if no document matches
  );
  return updateStatus;
};
export const updateOneInstrumentalCodesDB = async (stockExchangeCode, instrumentalCode) => {
  try {
    const acknowledge = await coreUpdateAllInstrumentalCodes(stockExchangeCode, instrumentalCode);
    if (acknowledge.upsertedId) {
      console.log(`Successfully document created for the ${stockExchangeCode}`);
      return { status: DB_STATUS.created, ack: `Successfully document created for the ${stockExchangeCode}` };
    }
    return {
      status: DB_STATUS.updated,
      ack: `Successfully document updated for the ${stockExchangeCode}`,
    };
  } catch (e) {
    console.log(`Error updating document for the ${stockExchangeCode}`, e);
    return {
      status: DB_STATUS.error,
      ack: `Error updating document for the ${stockExchangeCode} --> ${e}`,
    };
  }
};
