import { BreezeConnect } from 'breezeconnect';

import { API_KEY } from './keys.js';

export const connectBreeze = () => {
  globalThis.breezeInstance = new BreezeConnect({ appKey: API_KEY });
};
