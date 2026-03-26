import mongoose from 'mongoose';

const publicUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    tempToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const PublicUser = mongoose.model('PublicUser', publicUserSchema);

export default PublicUser;
