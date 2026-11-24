import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    // Source of request (either public user or field volunteer)
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

    category: {
      type: String,
      enum: ['Food & Water', 'Medical', 'Rescue', 'Shelter', 'Logistics', 'Other'],
      default: 'Other',
    },

    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    affectedCount: {
      type: Number,
      default: 1,
      min: 1,
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
          min: 1,
        },

        description: { type: String, required: true, trim: true },

        grantedList: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GrantedHelp',
          },
        ],
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'validated', 'in-progress', 'resolved'],
      default: 'pending',
    },

    requiredVolunteers: [
      {
        role: { type: String, required: true },
        count: { type: Number, required: true, min: 1 },
        assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
      },
    ],

    // Volunteer who validated the crisis report
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
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
          default: 1,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  { timestamps: true }
);

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;
