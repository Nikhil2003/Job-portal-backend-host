import { mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name must contain at least 2 characters."],
    maxLength: [30, "Name cannot exceed 30 characters."],
  },
  email: {
    type: String,
    required: true, //which we definitely required we will keep it true.
    validate: [validator.isEmail, "Please provide valid email."],
  },
  phone: {
    type: Number,
    required: true,
  },
  niches: [
    {
      type: String,
      required: true,
    },
  ],
  password: {
    type: String,
    required: true,
    Select: false, //from this no one can access the password
  },
  profilePhoto : {
    public_id : String,
    url : String,
  },
  resume: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["Applicant", "Employer"], //here we are giving only two option, not too much.
  },
  createdAt : {
    type: Date,
    default: Date.now,
  },
  skills: [{ type: String }],
  bio: {
    type: String,
    minLength: [10, "Bio must contain at least 10 characters."],
  },
  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  appliedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  postedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
});

//Just let us consider that you want to do some changes or updation before the user registration then for this purpose we use the " pre ".
//here we are bcrypt the password of user to keep the password more secure.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcrypt.hash(this.password, 10);
});

// now after encryption user wants that thier password will show as it is as he or she was written. so for it we have to create the function which compare the enteredPassowrd and the decrypted password.

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//sign fuction generates the token and always try to give the unique payload string to generate the different token as much as you can.

userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    //Sending role and username in the token so that we dont have to call backend every time for small details
    { id: this._id, role: this.role, name: this.name, username: this.username },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

export const User = mongoose.model("User", userSchema);
