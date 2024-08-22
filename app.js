import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import companyRouter from "./routes/companyRouter.js";
import { newsLetterCron } from "./automation/newsLetterCron.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get the current directory in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
config({ path: "./config/config.env" });

// Ensure the 'temp' directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.use(
  cors({
    origin: ["https://jobster-main.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tempDir, // Use the relative path for the temp directory
  })
);

app.use("/api/v1/user", userRouter); // Calling the userRoutes
app.use("/api/v1/job", jobRouter); // Calling the jobRoutes
app.use("/api/v1/company", companyRouter); // Calling the companyRouter

app.use("/api/v1/application", applicationRouter);

app.get('/', (req, res) => {
  res.send('API is running....');
});

newsLetterCron();
connection(); // Connect to the database using mongoose

app.use(errorMiddleware); // Handle errors

export default app;
