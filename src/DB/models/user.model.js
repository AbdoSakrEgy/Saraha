import { model, Schema, Types } from "mongoose";
import { decryption, encryption } from "../../utils/crypto.js";
import { hash } from "../../utils/bcrypt.js";

export const Roles = {
  admin: "admin",
  user: "user",
};
export const Gender = {
  male: "male",
  female: "female",
};
export const Providers = {
  system: "system",
  google: "google",
};
Object.freeze(Roles);
Object.freeze(Gender);
Object.freeze(Providers);

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      min: 4,
      max: 50,
      unique: true,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      // Nested schema
      otp: {
        type: String,
        set: (value) => hash(value),
      },
      expiredIn: Date,
    },
    newEmail: {
      type: String,
      min: 4,
      max: 50,
    },
    newEmailOtp: {
      otp: {
        type: String,
        set: (value) => hash(value),
      },
      expiredIn: Date,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == Providers.system ? true : false;
      },
      min: 3,
      max: 50,
      set: (value) => {
        return hash(value);
      },
    },
    passwordOtp: {
      // Nested schema
      otp: {
        type: String,
        set: (value) => hash(value),
      },
      expiredIn: Date,
    },
    pastPasswords: [
      {
        type: String,
        set: (value) => {
          return hash(value);
        },
      },
    ],
    age: Number,
    role: {
      type: String,
      default: Roles.user,
      enum: Object.values(Roles),
    },
    gender: {
      type: String,
      default: Gender.male,
      enum: Object.values(Gender),
    },
    phone: {
      type: String,
      required: function () {
        return this.provider == Providers.system ? true : false;
      },
      set: (value) => {
        if (value) {
          return encryption(value);
        } else {
          return value;
        }
      },
      get: (value) => {
        if (value) {
          return decryption(value);
        } else {
          return value;
        }
      },
    },
    credentialsChangedAt: {
      type: Date,
    },
    provider: {
      type: String,
      enum: Object.values(Providers),
      default: Providers.system,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedBy: {
      type: Types.ObjectId,
    },
  },
  {
    timestamps: true,
    virtuals: {
      userData: {
        get() {
          return `Hello user ${this.name} your age is ${this.age}`;
        },
      },
    },
    methods: {
      comparePassword(password) {
        if (this.password == password) {
          return true;
        } else {
          return false;
        }
      },
    },
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

const userModel = model("users", schema);

export default userModel;
