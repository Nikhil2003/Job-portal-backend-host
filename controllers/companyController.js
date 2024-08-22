import { Company } from "../models/companySchema.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addCompany = async (req, res) => {
  try {
    const { name, email, phone, address, website, description, admin } =
      req.body;

      const existingCompany = await Company.findOne({ name });
      if (existingCompany) {
        return res.status(400).json({ success: false, message: "Company already exists" });
      }

      const companyData = {
        name,
        email,
        phone,
        address,
        website,
        description,
        admin
      };

      if (req.files && req.files?.logo) {
        const { logo } = req.files;
        if (logo) {
          try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
              logo.tempFilePath,
              { folder: "Company_Logo" }
            );
            if (!cloudinaryResponse || cloudinaryResponse.error) {
              return res.status(500).json({ success: false, message: "Failed to upload logo to cloud." });
            }
            companyData.logo = {
              public_id: cloudinaryResponse.public_id, // we are storing the logo in the companyData list.
              url: cloudinaryResponse.secure_url,
            };
          } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to upload logo" });
          }
        }
      }
      const company = await Company.create(companyData);
      await User.findByIdAndUpdate(admin, { company: company._id });
      const updatedUser = await User.findById(admin,{
        password : 0
      });
      res.status(201).json({ success: true, user : updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, company });
}catch(error){
  res.status(500).json({ success: false, message: error.message });
}
}

export const getCompanyDetailsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const company = await Company.find({name}).populate("companyJobs").populate("admin", "name email profilePhoto");
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, company });
}catch(error){
  res.status(500).json({ success: false, message: error.message });
}
}