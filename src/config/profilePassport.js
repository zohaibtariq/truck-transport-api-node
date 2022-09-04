const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { Profile } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid profile token type');
    }
    const profile = await Profile.findById(payload.sub);
    if (!profile) {
      return done(null, false);
    }
    done(null, profile);
  } catch (error) {
    done(error, false);
  }
};

const jwtProfileStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtProfileStrategy,
};
