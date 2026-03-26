import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    publicUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PublicUser',
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    crisisDescription: {
      type: String,
      required: true,
    },
    requirements: [
      {
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        description: { type: String, required: true },
        grantedList: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GrantedHelp',
          }
        ],
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'validated', 'in-progress', 'resolved'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedByNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ngo',
      default: null,
    },

    hype: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Volunteer',
        },
        points: {
          type: Number,
          default: 0,
        }
      }
    ],

  },
  { timestamps: true }
);

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;

