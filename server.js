import app from "./app.js";
import cloudinary from "cloudinary";
import events from "events";

events.EventEmitter.defaultMaxListeners = 15;

cloudinary.v2.config({            //here we connected the backend with cloudinary to upload the files like resume and coverletter.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,    
  api_secret: process.env.CLOUDINARY_API_SECRET,

});

app.listen(process.env.PORT, () => {
  console.log(`server running at port ${process.env.PORT}`);
});