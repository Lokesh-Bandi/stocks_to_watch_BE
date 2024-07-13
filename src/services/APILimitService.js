import { RESPONSE_MESSAGE } from './constants.js';
import { getCurrentTime } from './utils/utils.js';

class ApiRateLimiter {
  constructor(
    apiInstance,
    executorCallback,
    {
      maxCallsPerSecond,
      maxCallsPerMinute,
      maxCallsPerHour,
      maxCallsPerDay,
    } = {
      maxCallsPerSecond: undefined,
      maxCallsPerMinute: undefined,
      maxCallsPerHour: undefined,
      maxCallsPerDay: undefined,
    },
    manualStopCount = undefined
  ) {
    this.init();
    this.maxCallsPerSecond = maxCallsPerSecond;
    this.maxCallsPerMinute = maxCallsPerMinute;
    this.maxCallsPerHour = maxCallsPerHour;
    this.maxCallsPerDay = maxCallsPerDay;
    this.executorCallback = executorCallback;
    this.apiInstance = apiInstance;
    this.manualStopCount = (() => {
      if (!manualStopCount) {
        return this.maxCallsPerDay ? this.maxCallsPerDay : this.MAX_API_CALLs;
      }
      return manualStopCount > this.maxCallsPerDay
        ? this.maxCallsPerDay
        : manualStopCount;
    })();
  }

  init = () => {
    this.totalCount = 0;

    this.currentCountPerSecond = 0;

    this.currentCountPerMinute = 0;

    this.currentCountPerHour = 0;

    this.currentCountPerDay = 0;

    this.MAX_API_CALLs = 100000;

    this.responseMessage = '';
  };

  executeAPIInvoker = async () => {
    const result = [];
    while (true) {
      if (this.totalCount === this.manualStopCount) {
        this.responseMessage = RESPONSE_MESSAGE.manualStopCountReached;
        if (this.manualStopCount === this.MAX_API_CALLs) {
          this.responseMessage = RESPONSE_MESSAGE.maximumCountReached;
        }
        if (this.manualStopCount === this.maxCallsPerDay) {
          this.responseMessage = RESPONSE_MESSAGE.maximumDayLimitReached;
        }
        break;
      }

      if (this.isHourLimitReached()) await this.sleepNow(1000 * 60 * 60);
      else if (this.isMinuteLimitReached()) await this.sleepNow(1000 * 60);
      else if (this.isSecondLimitReached()) await this.sleepNow(1000);

      try {
        const apiResult = await this.executorCallback(
          this.apiInstance,
          this.totalCount
        );
        result.push(apiResult);
      } catch (e) {
        this.responseMessage = RESPONSE_MESSAGE.errorWhileFetching;
        break;
      }
      this.totalCount += 1;
      this.currentCountPerDay += 1;
      this.currentCountPerSecond += 1;
      this.currentCountPerMinute += 1;
      this.currentCountPerHour += 1;
    }
    return result;
  };

  isDayLimitReached = () => {
    if (
      this.currentCountPerDay > 0 &&
      this.currentCountPerDay % this.maxCallsPerDay === 0
    ) {
      console.log(`Day Limit Reached: ${this.totalCount} ${getCurrentTime()}`);
      this.currentCountPerDay = 0;
      this.currentCountPerHour = 0;
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      return true;
    }
    return false;
  };

  isHourLimitReached = () => {
    if (
      this.currentCountPerHour > 0 &&
      this.currentCountPerHour % this.maxCallsPerHour === 0
    ) {
      console.log(
        `Hour Limit Reached : ${this.totalCount} ${getCurrentTime()}`
      );
      this.currentCountPerHour = 0;
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      return true;
    }
    return false;
  };

  isMinuteLimitReached = () => {
    if (
      this.currentCountPerMinute > 0 &&
      this.currentCountPerMinute % this.maxCallsPerMinute === 0
    ) {
      console.log(
        `Minute Limit Reached : ${this.totalCount} ${getCurrentTime()}`
      );
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      return true;
    }
    return false;
  };

  isSecondLimitReached = () => {
    if (
      this.currentCountPerSecond > 0 &&
      this.currentCountPerSecond % this.maxCallsPerSecond === 0
    ) {
      console.log(
        `Second Limit Reached v1: ${this.totalCount} ${getCurrentTime()}`
      );
      this.currentCountPerSecond = 0;
      return true;
    }
    return false;
  };

  // eslint-disable-next-line class-methods-use-this
  sleepNow = (delay) => {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  };

  startRateLimiter = async () => {
    try {
      const apiResult = await this.executeAPIInvoker();
      return {
        data: apiResult,
        message: this.responseMessage,
      };
    } catch (e) {
      return {
        data: [],
        message: this.responseMessage,
      };
    }
  };
}

export default ApiRateLimiter;
