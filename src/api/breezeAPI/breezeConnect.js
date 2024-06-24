import { BreezeConnect } from 'breezeconnect';

import { API_KEY, SECRET_KEY, SESSION_KEY } from './keys.js';

export const connectBreeze = async () => {
  try {
    //initiating the breeze instance
    globalThis.breezeInstance = new BreezeConnect({ appKey: API_KEY });
    // create a session
    await globalThis.breezeInstance.generateSession(SECRET_KEY,SESSION_KEY);

    console.log('Breeze Connection Established');

  } catch (e) {
    console.log(e);
    console.log('Breeze Connection Failed');

  }
};
