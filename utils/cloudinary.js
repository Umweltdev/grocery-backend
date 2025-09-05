const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async (fileToUploads, folder) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(fileToUploads, {
        resource_type: "auto",
        folder: folder,
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id, 
          });
        }
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};
const cloudinaryDeleteImg = async (fileToDelete) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(fileToDelete, {
        resource_type: "image",
        // folder: folder
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // console.log(result);
          // Check if the image was successfully deleted
          if (result.result === "ok") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { cloudinaryUploadImg,cloudinaryDeleteImg };
