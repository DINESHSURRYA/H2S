import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'weekends', 'on-call'],
      default: 'part-time',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
