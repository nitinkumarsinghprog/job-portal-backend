const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadFile = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("========== Cloudinary Success ==========");
    console.log({
      publicId: response.public_id,
      secureUrl: response.secure_url,
      resourceType: response.resource_type,
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.log("========== Cloudinary Error ==========");
    console.dir(error, { depth: null });

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw error;
  }
};

module.exports = uploadFile;
