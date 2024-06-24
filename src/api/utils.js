import crypto from 'crypto';

import { API_KEY, SECRET_KEY } from './breezeAPI/keys.js';

export const getBreezeRequestConfig = (payload) => {
  const timeStamp = new Date().getTime().toString();
  const data = JSON.stringify(payload);
  const rawChecksum = `${timeStamp}\r\n${data}`;
  const checksum = crypto.createHmac('sha256', SECRET_KEY).update(rawChecksum);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Checksum': `token ${checksum}`,
      'X-Timestamp': timeStamp,
      'X-AppKey': API_KEY,
      'X-SessionToken': '42925844',
    },
    data,
  };
  console.log(config);
  return config;
};
