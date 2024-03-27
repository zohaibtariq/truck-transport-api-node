const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime',
  },
};
const paymentLoadLogSchema = Schema(
  {
    loadId: {
      required: true,
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Load',
    },
    driverId: {
      required: true,
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
    },
    addSubtractFlag: String,
    cardBalance: String,
    charges: String,
    // customerId: String,
    loadAmount: String,
    plusLessFlag: String,
    referenceNumber: String,
    responseCode: String,
    responseMessage: String,
    trackingNumber: String,
    paymentProcessedActualDateTime: Date,
    beforePaymentLoadPaidAmount: Number,
    afterPaymentLoadPaidAmount: Number,
    pendingTobePaidLoadAmount: Number,
  },
  opts
);

// add plugin that converts mongoose to json
paymentLoadLogSchema.plugin(toJSON);
paymentLoadLogSchema.plugin(paginate);

paymentLoadLogSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef PaymentLoad
 */
const PaymentLoad = mongoose.model('PaymentLoad', paymentLoadLogSchema);

module.exports = PaymentLoad;
