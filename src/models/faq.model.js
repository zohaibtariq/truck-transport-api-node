const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const faqSchema = mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
      required: true,
      default: '',
    },
    answer: {
      type: String,
      trim: true,
      required: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.plugin(toJSON);
faqSchema.plugin(paginate);

faqSchema.pre('save', async function (next) {
  next();
});

const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;
