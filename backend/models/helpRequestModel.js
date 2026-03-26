import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    // ✅ Source of request (either one)
    publicUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PublicUser',
      default: null,
    },

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null,
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
      trim: true,
    },

    requirements: [
      {
        itemName: { type: String, required: true, trim: true },

        quantity: {
          type: Number,
          required: true,
          min: 1, // 🔒 prevents negative / zero
        },

        description: { type: String, required: true, trim: true },

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

    // ✅ Who validated it
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
          min: 0,
        }
      }
    ],

  },
  { timestamps: true }
);

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;