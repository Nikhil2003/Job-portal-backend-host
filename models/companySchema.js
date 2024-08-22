import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
    address: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    logo: {
        public_id: String,
        url: String
    },
    description: {
        type: String,
        required: true
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    companyJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job"
        }
    ]
})

export const Company = mongoose.model('Company', companySchema);