const { v2: cloudinary } = require("cloudinary");

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),

  upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX?.trim() || undefined,
};

if (
  !cloudinaryConfig.cloud_name ||
  !cloudinaryConfig.api_key ||
  !cloudinaryConfig.api_secret
) {
  throw new Error(
    "Cloudinary configuration is incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
  );
}

cloudinary.config(cloudinaryConfig);

module.exports = cloudinary;
