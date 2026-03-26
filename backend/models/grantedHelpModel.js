import mongoose from 'mongoose';

const grantedHelpSchema = new mongoose.Schema(
  {
    quantityApproved: {
      type: Number,
      required: true,
      min: 1
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ngo',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    helpRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      required: true
    }
  },
  { timestamps: true }
);

const GrantedHelp = mongoose.model('GrantedHelp', grantedHelpSchema);
export default GrantedHelp;