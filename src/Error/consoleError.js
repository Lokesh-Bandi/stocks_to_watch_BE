export const consoleError = (errorType, errorCode, errorMessage) => {
  let errorString = `${errorType} ERROR: `;

  if (errorCode) {
    errorString += `${errorCode} - `;
  }

  errorString += errorMessage;
  console.log(errorString);
};
