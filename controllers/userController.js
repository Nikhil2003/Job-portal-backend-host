import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcrypt";

//creating the Registeration part for the register routes.

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, niches } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return next(
        new ErrorHandler("All fields are required, write again.", 400)
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email is already registered.", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      niches: niches.length > 0 ? niches : [],
    };
    if (req.files && req.files?.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_Seekers_Resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud.", 500)
            );
          }
          userData.resume = {
            public_id: cloudinaryResponse.public_id, // we are storing the resume in the userdata list.
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }

    if (req.files && req.files?.profilePhoto) {
      const { profilePhoto } = req.files;
      if (profilePhoto) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            profilePhoto.tempFilePath,
            { folder: "Job_Seekers_Profile" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload profile photo to cloud.", 500)
            );
          }
          userData.profilePhoto = {
            public_id: cloudinaryResponse.public_id, // we are storing the profile photo in the userdata list.
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload profilePhoto", 500));
        }
      }
    }
    const user = await User.create(userData);
    await sendToken(user, 201, res, "User Registered.");
  } catch (error) {
    next(error);
  }
};

//creating the login part for login routes.

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Email,password and role are required", 400));
  }

  //to check whether this email present in the database or not.
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  if (user.role !== role) {
    return next(new ErrorHandler("Invalid user role", 400));
  }

  sendToken(user, 200, res, "User logged in successfully.");
});

//now we create function that user can get their own details

export const getUser = catchAsyncErrors(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Below code is for updating the profile of the user

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
  };
  const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

  if (
    req.user.role === "Job Seeker" &&
    (!firstNiche || !secondNiche || !thirdNiche)
  ) {
    return next(
      new ErrorHandler("Please provide your all preferred job niches.", 400)
    );
  }
  if (req.files) {
    const resume = req.files.resume;
    if (resume) {
      const currentResumeId = req.user.resume.public_id;
      if (currentResumeId) {
        await cloudinary.uploader.destroy(currentResumeId);
      }
      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "Job_Seekers_Resume",
      });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
    message: "Profile updated.",
  });
});

export const editProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const userInDb = await User.findOne({ email: req.body.email });
    if (!userInDb) {
      return next(new ErrorHandler("User not found", 404));
    }
    const { name, email, phone, niches, bio } = req.body;

    const userData = {
      name,
      email,
      phone,
      bio,
      niches: niches?.length > 0 ? niches : [],
    };
    if (req.files && req.files?.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_Seekers_Resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud.", 500)
            );
          }
          userData.resume = {
            public_id: cloudinaryResponse.public_id, // we are storing the resume in the userdata list.
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }

    if (req.files && req.files?.profilePhoto) {
      const { profilePhoto } = req.files;
      if (profilePhoto) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            profilePhoto.tempFilePath,
            { folder: "Job_Seekers_Profile" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload profile photo to cloud.", 500)
            );
          }
          userData.profilePhoto = {
            public_id: cloudinaryResponse.public_id, // we are storing the profile photo in the userdata list.
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload profilePhoto", 500));
        }
      }
    }

    const user = await User.findOneAndUpdate({ email }, userData);
    res.status(200).json({
      success: true,
      user,
      message: "Profile updated.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//updating the password - user profile
// If existing password matches of the user - comparePassword method

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await user.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  // old password is incorrect - i.e  bad request is made by user
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is Incorrect.", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("New password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password updated successfully.");
});
