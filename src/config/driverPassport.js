const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { Driver } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const driver = await Driver.findById(payload.sub);
    if (!driver) {
      return done(null, false);
    }
    done(null, driver);
  } catch (error) {
    done(error, false);
  }
};

const jwtDriverStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtDriverStrategy,
};
