import mongoose from "mongoose";

export const connection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Job_Portal_With_Automation",
    })
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log(`this error find ${err}`);
    });
};
