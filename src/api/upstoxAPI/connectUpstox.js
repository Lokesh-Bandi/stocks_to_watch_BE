import UpstoxClient from 'upstox-js-sdk';

import { API_KEY, API_VERSION, AUTH_CODE, REDIRECT_URL, SECRET_KEY } from './keys.js';

const connectUpstox = async () => {
  const apiInstance = new UpstoxClient.LoginApi();
  const apiVersion = API_VERSION;
  const opts = {
    code: AUTH_CODE,
    clientId: API_KEY,
    clientSecret: SECRET_KEY,
    redirectUri: REDIRECT_URL,
    grantType: 'authorization_code',
  };
  apiInstance.token(apiVersion, opts, (error, data) => {
    if (error) {
      // console.error(error);
    } else {
      console.log(`API called successfully. Returned data: ${data}}`);
    }
  });
};

export default connectUpstox;
