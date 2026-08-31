// The ONLY place the self-referencing `bbb-breakout-sdk` dependency is
// imported. When a breakout-v* tag is generated (scripts/make-breakout-tag.sh),
// this file is replaced by sdk-loader.breakout.js, since breakout builds strip
// that dependency from package.json (a breakout cannot open another breakout).
import BbbBreakoutSdk from 'bbb-breakout-sdk';

export default BbbBreakoutSdk;
