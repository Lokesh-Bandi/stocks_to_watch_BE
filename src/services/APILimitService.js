import { getCurrentTime } from './utils/utils.js';

class ApiRateLimiter {
  constructor(
    executorCallback,
    manualStopCount = 0,
    {
      maxCallsPerSecond,
      maxCallsPerMinute,
      maxCallsPerHour,
      maxCallsPerDay,
    } = {
      maxCallsPerSecond: 0,
      maxCallsPerMinute: 0,
      maxCallsPerHour: 0,
      maxCallsPerDay: 0,
    }
  ) {
    this.maxCallsPerSecond = maxCallsPerSecond;
    this.maxCallsPerMinute = maxCallsPerMinute;
    this.maxCallsPerHour = maxCallsPerHour;
    this.maxCallsPerDay = maxCallsPerDay;
    this.executorCallback = executorCallback;
    this.manualStopCount =
      manualStopCount ||
      maxCallsPerDay ||
      maxCallsPerHour ||
      maxCallsPerMinute ||
      maxCallsPerSecond;
    this.resultData = [];
    this.init();
  }

  init = () => {
    this.secondsIntervalID = 0;

    this.minutesIntervalID = 0;

    this.hoursIntervalID = 0;

    this.daysIntervalID = 0;

    this.totalCount = 0;

    this.currentCountPerSecond = 0;

    this.currentCountPerMinute = 0;

    this.currentCountPerHour = 0;

    this.currentCountPerDay = 0;

    this.callerFunObject = {};

    this.apiPromisesQueue = [];

    this.TIMER_CODES = {
      DAY: 'day',
      HOUR: 'hour',
      MINUTE: 'minute',
      SECOND: 'second',
    };

    this.EXECUTE_CORE = 'execute';

    this.EXECUTE_TIMER_CODE = '';

    this.DEFAULT_CALLER_FUN_OBJ = {
      [this.TIMER_CODES.DAY]: this.everyHourInvoker,
      [this.TIMER_CODES.HOUR]: this.everyMinuteInvoker,
      [this.TIMER_CODES.MINUTE]: this.everySecondInvoker,
      [this.TIMER_CODES.SECOND]: this.executeAPIInvoker,
    };

    this.EXECUTE_TIMER_CODE = (() => {
      let result = '';
      if (this.maxCallsPerDay) {
        result += `${this.TIMER_CODES.DAY}_`;
      }
      if (this.maxCallsPerHour) {
        result += `${this.TIMER_CODES.HOUR}_`;
      }
      if (this.maxCallsPerMinute) {
        result += `${this.TIMER_CODES.MINUTE}_`;
      }
      if (this.maxCallsPerSecond) {
        result += `${this.TIMER_CODES.SECOND}_`;
      }
      return result + this.EXECUTE_CORE;
    })();
    console.log('[EXECUTION TIMER CODE] : ', this.EXECUTE_TIMER_CODE);
    this.callerFunObject = this.constructCallerFunObject();
    console.log('[CALLER FUNCTION OBJECT] : ', this.callerFunObject);
  };

  constructCallerFunObject = () => {
    const finalCallerFunObj = {};
    const executionTimerCodeArray = this.EXECUTE_TIMER_CODE.split('_');
    for (let i = 0; i < executionTimerCodeArray.length - 1; i += 1) {
      finalCallerFunObj[executionTimerCodeArray[i]] = (() => {
        switch (executionTimerCodeArray[i + 1]) {
          case this.TIMER_CODES.HOUR:
            return this.DEFAULT_CALLER_FUN_OBJ[this.TIMER_CODES.DAY];
          case this.TIMER_CODES.MINUTE:
            return this.DEFAULT_CALLER_FUN_OBJ[this.TIMER_CODES.HOUR];
          case this.TIMER_CODES.SECOND:
            return this.DEFAULT_CALLER_FUN_OBJ[this.TIMER_CODES.MINUTE];
          case this.EXECUTE_CORE:
            return this.DEFAULT_CALLER_FUN_OBJ[this.TIMER_CODES.SECOND];
          default:
            return null;
        }
      })();
    }
    return finalCallerFunObj;
  };

  getStarter = () => {
    const initialTimerCode = this.EXECUTE_TIMER_CODE.split('_')[0];
    if (initialTimerCode === this.TIMER_CODES.DAY) return this.everyDayInvoker;
    if (initialTimerCode === this.TIMER_CODES.HOUR)
      return this.everyHourInvoker;
    if (initialTimerCode === this.TIMER_CODES.MINUTE)
      return this.everyMinuteInvoker;
    if (initialTimerCode === this.TIMER_CODES.SECOND)
      return this.everySecondInvoker;
    return this.executeAPIInvoker;
  };

  getMaxCallsPerTime = (timerCode) => {
    if (timerCode === this.TIMER_CODES.DAY) return this.maxCallsPerDay;
    if (timerCode === this.TIMER_CODES.HOUR) return this.maxCallsPerHour;
    if (timerCode === this.TIMER_CODES.MINUTE) return this.maxCallsPerMinute;
    if (timerCode === this.TIMER_CODES.SECOND) return this.maxCallsPerSecond;
    return 0;
  };

  isDayLimitReached = () => {
    if (this.currentCountPerDay % this.maxCallsPerDay === 0) {
      console.log(`Day Limit Reached: ${this.totalCount} ${getCurrentTime()}`);
      this.currentCountPerDay = 0;
      this.currentCountPerHour = 0;
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      clearInterval(this.daysIntervalID);
      clearInterval(this.hoursIntervalID);
      clearInterval(this.minutesIntervalID);
      clearInterval(this.secondsIntervalID);
      return true;
    }
    return false;
  };

  isHourLimitReached = () => {
    if (this.currentCountPerHour % this.maxCallsPerHour === 0) {
      console.log(`Hour Limit Reached: ${this.totalCount} ${getCurrentTime()}`);
      this.currentCountPerHour = 0;
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      clearInterval(this.minutesIntervalID);
      clearInterval(this.secondsIntervalID);
      return true;
    }
    return false;
  };

  isMinuteLimitReached = () => {
    if (this.currentCountPerMinute % this.maxCallsPerMinute === 0) {
      console.log(
        `Minute Limit Reached: ${this.totalCount} ${getCurrentTime()}`
      );
      this.currentCountPerMinute = 0;
      this.currentCountPerSecond = 0;
      clearInterval(this.secondsIntervalID);
      return true;
    }
    return false;
  };

  isSecondLimitReached = () => {
    if (this.currentCountPerSecond % this.maxCallsPerSecond === 0) {
      console.log(
        `Second Limit Reached: ${this.totalCount} ${getCurrentTime()}`
      );
      this.currentCountPerSecond = 0;
      return true;
    }
    return false;
  };

  stopAllExecutions = () => {
    this.currentCountPerDay = 0;
    this.currentCountPerHour = 0;
    this.currentCountPerMinute = 0;
    this.currentCountPerSecond = 0;
    clearInterval(this.daysIntervalID);
    clearInterval(this.hoursIntervalID);
    clearInterval(this.minutesIntervalID);
    clearInterval(this.secondsIntervalID);
  };

  executeAPIInvoker = async ({ calledFrom }) => {
    console.log(
      `[EXECUTION CORE] -- [CALLED FROM] :  ${calledFrom}-invoker  ${getCurrentTime()}`
    );
    const executionCount = this.getMaxCallsPerTime(calledFrom);
    for (let i = 1; i <= executionCount; i += 1) {
      this.totalCount += 1;
      this.currentCountPerSecond += 1;
      this.currentCountPerMinute += 1;
      this.currentCountPerHour += 1;
      this.currentCountPerDay += 1;

      await this.executorCallback(this.totalCount);

      if (this.manualStopCount === this.totalCount) {
        this.stopAllExecutions();
        return;
      }

      if (this.isDayLimitReached()) return;

      if (this.isHourLimitReached()) return;

      if (this.isMinuteLimitReached()) return;

      if (this.isSecondLimitReached()) return;
    }
  };

  everySecondInvoker = ({ calledFrom }) => {
    console.log(
      `[SECOND INVOKER] -- [CALLED FROM] :  ${calledFrom}-invoker   ${getCurrentTime()}`
    );
    clearInterval(this.secondsIntervalID);
    this.secondsIntervalID = setInterval(() => {
      this.callerFunObject[this.TIMER_CODES.SECOND]({
        calledFrom: this.TIMER_CODES.SECOND,
      });
    }, 1000);
    this.callerFunObject[this.TIMER_CODES.SECOND]({
      calledFrom: this.TIMER_CODES.SECOND,
    });
  };

  everyMinuteInvoker = ({ calledFrom }) => {
    console.log(
      `[MINUTE INVOKER] -- [CALLED FROM] :  ${calledFrom}-invoker  ${getCurrentTime()}`
    );
    clearInterval(this.minutesIntervalID);
    this.minutesIntervalID = setInterval(() => {
      this.callerFunObject[this.TIMER_CODES.MINUTE]({
        calledFrom: this.TIMER_CODES.MINUTE,
      });
    }, 1000 * 60);
    this.callerFunObject[this.TIMER_CODES.MINUTE]({
      calledFrom: this.TIMER_CODES.MINUTE,
    });
  };

  everyHourInvoker = ({ calledFrom }) => {
    console.log(
      `[HOUR INVOKER] -- [CALLED FROM] :  ${calledFrom}-invoker  ${getCurrentTime()}`
    );
    clearInterval(this.hoursIntervalID);
    this.hoursIntervalID = setInterval(
      () => {
        this.callerFunObject[this.TIMER_CODES.HOUR]({
          calledFrom: this.TIMER_CODES.HOUR,
        });
      },
      1000 * 60 * 60
    );
    this.callerFunObject[this.TIMER_CODES.HOUR]({
      calledFrom: this.TIMER_CODES.HOUR,
    });
  };

  everyDayInvoker = ({ calledFrom }) => {
    console.log(
      `[DAY INVOKER] -- [CALLED FROM] :  ${calledFrom}-invoker  ${getCurrentTime()}`
    );
    clearInterval(this.daysIntervalID);
    this.daysIntervalID = setInterval(
      () => {
        this.callerFunObject[this.TIMER_CODES.DAY]({
          calledFrom: this.TIMER_CODES.DAY,
        });
      },
      1000 * 60 * 60 * 24
    );
    this.callerFunObject[this.TIMER_CODES.DAY]({
      calledFrom: this.TIMER_CODES.DAY,
    });
  };

  startRateLimiter = () => {
    this.getStarter()({ calledFrom: 'MAIN' });
  };
}

export default ApiRateLimiter;
