const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { inviteActions } = require('../config/inviteActions');

const invitedDriverSchema = mongoose.Schema(
  {
    invitedOnLoadId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Load',
      required: true,
    },
    inviteSentToDriverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
      required: true,
    },
    inviteSentByAdminId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteSentDateTime: {
      type: Date,
      required: true,
    },
    driverAction: {
      type: String,
      enum: [inviteActions.DORMANT, inviteActions.ACCEPTED, inviteActions.REJECTED],
      required: true,
      default: inviteActions.DORMANT,
    },
    driverActionDateTime: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
// invitedDriverSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const InvitedDriver = mongoose.model('InvitedDriver', invitedDriverSchema);

module.exports = InvitedDriver;
