import File from "../models/File.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "File is required",
    });
  }

  const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "secure-drop",
    resource_type: resourceType,
  });

  const file = await File.create({
    owner: req.user.userId,
    originalName: req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    mimeType: req.file.mimetype,
    size: req.file.size,
    resourceType: result.resource_type,
  });

  res.status(201).json({
    message: "File uploaded successfully",
    file,
  });
};
export const getMyFiles = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    type = "all",
    sort = "newest",
  } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(50, Math.max(1, Number(limit)));

  const skip = (pageNumber - 1) * limitNumber;

  // Base query: sirf logged-in user ki files
  const query = {
    owner: req.user.userId,
  };

  // Search by filename
  if (search.trim()) {
    query.originalName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // File type filter
  if (type === "pdf") {
    query.mimeType = "application/pdf";
  }

  if (type === "image") {
    query.mimeType = {
      $regex: "^image/",
    };
  }

  if (type === "doc") {
    query.mimeType = {
      $in: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };
  }

  // Sorting
  const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const files = await File.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber);

  const totalFiles = await File.countDocuments(query);

  const totalPages = Math.ceil(totalFiles / limitNumber);

  res.json({
    page: pageNumber,
    limit: limitNumber,
    totalFiles,
    totalPages,
    files,
  });
};

export const getFile = async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!file) {
    return res.status(404).json({
      message: "File does not exist",
    });
  }

  res.json({
    file,
  });
};

export const deleteFile = async (req, res) => {
  const file = req.fileResource;

  await deleteFromCloudinary(file.publicId, file.resourceType);
  await File.deleteOne({ _id: file._id });

  res.json({
    message: "File deleted successfully",
  });
};
export const updateFile = async (req, res) => {
  const file = req.fileResource;

  if (!req.file) {
    return res.status(400).json({
      message: "New file is required",
    });
  }

  await deleteFromCloudinary(file.publicId, file.resourceType);

  const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "secure-drop",
    resource_type: resourceType,
  });

  file.originalName = req.file.originalname;
  file.url = result.secure_url;
  file.publicId = result.public_id;
  file.mimeType = req.file.mimetype;
  file.size = req.file.size;
  file.resourceType = result.resource_type;

  await file.save();

  res.json({
    message: "File updated successfully",
    file,
  });
};

export const getAllFiles = async (req, res) => {
  const files = await File.find()
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.json({
    count: files.length,
    files,
  });
};
