import File from "../models/File.js";

export const checkFileOwnership = async (req, res, next) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      message: "File not found",
    });
  }

  const isOwner = file.owner.toString() === req.user.userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      message: "You cannot access this file",
    });
  }

  req.fileResource = file;
  next();
};
