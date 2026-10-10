const rolePermissions = {
  user: ["FILE_READ", "FILE_UPLOAD", "FILE_UPDATE", "FILE_DELETE"],
  admin: [
    "FILE_READ",
    "FILE_UPLOAD",
    "FILE_UPDATE",
    "FILE_DELETE",
    "ALL_FILES_READ",
    "ALL_FILES_DELETE",
    "USER_READ",
    "USER_MANAGE",
  ],
};

export const hasPermission = (permission) => {
  return (req, res, next) => {
    const permissions = rolePermissions[req.user?.role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        message: "You don't have permission to perform this action",
      });
    }

    next();
  };
};
