import mongoose from "mongoose";

const nameValidator = {
  type: String,
  required: true,
  minLength: [3, "First Name must be at least 3 characters"],
  maxLength: [20, "First Name must be at most 20 characters"],
  trim: true,
  match: [/^[A-Za-z]+$/, "Name must contain letters only"],
  set: (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
};

const userSchema = new mongoose.Schema(
  {
    firstName: nameValidator,
    lastName: nameValidator,

    email: {
      type: String,
      required: true,
      index: { name: "idx_email_unique", unique: true },
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    gender: {
      type: String,
      enum: ["male", "female", "n/a"],
      default: "n/a",
    },

    age: {
      type: Number,
      default: 18,
      min: [18, "Age must be at least 18"],
      max: [100, "Age must be at most 100"],
    },

    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      maxLength: [500, "Bio must be at most 500 characters"],
    },
  },
  {
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { _id, __v, password, ...user } = ret;

        return {
          id: _id.toString(),
          ...user,
        };
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { _id, __v, password, ...user } = ret;

        return {
          id: _id.toString(),
          ...user,
        };
      },
    },
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
