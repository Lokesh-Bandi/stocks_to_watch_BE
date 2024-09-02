import {
  bearishengulfingpattern,
  bearishharami,
  bearishharamicross,
  eveningdojistar,
  eveningstar,
  bearishmarubozu,
  threeblackcrows,
  bearishhammerstick,
  bearishinvertedhammerstick,
  hangingman,
  hangingmanunconfirmed,
  shootingstar,
  shootingstarunconfirmed,
  tweezertop,
  bullishengulfingpattern,
  downsidetasukigap,
  bullishharami,
  bullishharamicross,
  morningdojistar,
  morningstar,
  bullishmarubozu,
  piercingline,
  threewhitesoldiers,
  bullishhammerstick,
  bullishinvertedhammerstick,
  hammerpattern,
  hammerpatternunconfirmed,
  tweezerbottom,
} from 'technicalindicators';

const BEARISH_PATTERNS = [
  'BearishEngulfingPattern',
  'BearishHarami',
  'BearishHaramiCross',
  'EveningDojiStar',
  'EveningStar',
  'BearishMarubozu',
  'ThreeBlackCrows',
  'BearishHammerStick',
  'BearishInvertedHammerStick',
  'HangingMan',
  'HangingManUnconfirmed',
  'ShootingStar',
  'ShootingStarUnconfirmed',
  'TweezerTop',
];

const BULLISH_PATTERNS = [
  'BullishEngulfingPattern',
  'DownsideTasukiGap',
  'BullishHarami',
  'BullishHaramiCross',
  'MorningDojiStar',
  'MorningStar',
  'BullishMarubozu',
  'PiercingLine',
  'ThreeWhiteSoldiers',
  'BullishHammerStick',
  'BullishInvertedHammerStick',
  'HammerPattern',
  'HammerPatternUnconfirmed',
  'TweezerBottom',
];

export const CANDLESTICKS_PATTERNS = {
  BullishEngulfingPattern: {
    name: 'BullishEngulfingPattern',
    instance: bullishengulfingpattern,
  },
  DownsideTasukiGap: {
    name: 'DownsideTasukiGap',
    instance: downsidetasukigap,
  },
  BullishHarami: {
    name: 'BullishHarami',
    instance: bullishharami,
  },
  BullishHaramiCross: {
    name: 'BullishHaramiCross',
    instance: bullishharamicross,
  },
  MorningDojiStar: {
    name: 'MorningDojiStar',
    instance: morningdojistar,
  },
  MorningStar: {
    name: 'MorningStar',
    instance: morningstar,
  },
  BullishMarubozu: {
    name: 'BullishMarubozu',
    instance: bullishmarubozu,
  },
  PiercingLine: {
    name: 'PiercingLine',
    instance: piercingline,
  },
  ThreeWhiteSoldiers: {
    name: 'ThreeWhiteSoldiers',
    instance: threewhitesoldiers,
  },
  BullishHammerStick: {
    name: 'BullishHammerStick',
    instance: bullishhammerstick,
  },
  BullishInvertedHammerStick: {
    name: 'BullishInvertedHammerStick',
    instance: bullishinvertedhammerstick,
  },
  HammerPattern: {
    name: 'HammerPattern',
    instance: hammerpattern,
  },
  HammerPatternUnconfirmed: {
    name: 'HammerPatternUnconfirmed',
    instance: hammerpatternunconfirmed,
  },
  TweezerBottom: {
    name: 'TweezerBottom',
    instance: tweezerbottom,
  },
  BearishEngulfingPattern: {
    name: 'BearishEngulfingPattern',
    instance: bearishengulfingpattern,
  },
  BearishHarami: {
    name: 'BearishHarami',
    instance: bearishharami,
  },
  BearishHaramiCross: {
    name: 'BearishHaramiCross',
    instance: bearishharamicross,
  },
  EveningDojiStar: {
    name: 'EveningDojiStar',
    instance: eveningdojistar,
  },
  EveningStar: {
    name: 'EveningStar',
    instance: eveningstar,
  },
  BearishMarubozu: {
    name: 'BearishMarubozu',
    instance: bearishmarubozu,
  },
  ThreeBlackCrows: {
    name: 'ThreeBlackCrows',
    instance: threeblackcrows,
  },
  BearishHammerStick: {
    name: 'BearishHammerStick',
    instance: bearishhammerstick,
  },
  BearishInvertedHammerStick: {
    name: 'BearishInvertedHammerStick',
    instance: bearishinvertedhammerstick,
  },
  HangingMan: {
    name: 'HangingMan',
    instance: hangingman,
  },
  HangingManUnconfirmed: {
    name: 'HangingManUnconfirmed',
    instance: hangingmanunconfirmed,
  },
  ShootingStar: {
    name: 'ShootingStar',
    instance: shootingstar,
  },
  ShootingStarUnconfirmed: {
    name: 'ShootingStarUnconfirmed',
    instance: shootingstarunconfirmed,
  },
  TweezerTop: {
    name: 'TweezerTop',
    instance: tweezertop,
  },
};

export const candlestickPattternStatus = ({ open, high, low, close, volume }) => {
  const allPatterns = Object.keys(CANDLESTICKS_PATTERNS);
  const baseObject = {
    bullish: [],
    bearish: [],
  };
  return allPatterns.reduce((acc, eachPattern) => {
    const hasPattern = CANDLESTICKS_PATTERNS[eachPattern].instance({
      open,
      high,
      low,
      close,
      volume,
    });
    const isBullish = BULLISH_PATTERNS.includes(eachPattern);
    if (hasPattern) {
      if (isBullish) {
        baseObject.bullish.push(eachPattern);
      } else {
        baseObject.bearish.push(eachPattern);
      }
    }
    return acc;
  }, baseObject);
};
