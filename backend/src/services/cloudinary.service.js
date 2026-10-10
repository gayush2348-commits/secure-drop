import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};
export const deleteFromCloudinary = (publicId, resourceType) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};
