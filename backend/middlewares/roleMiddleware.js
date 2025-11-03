export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

export const isStudent = authorizeRoles('student');

export const isCounsellor = authorizeRoles('counsellor');

export const isAdmin = authorizeRoles('admin');

export const isAdminOrCounsellor = authorizeRoles('admin', 'counsellor');
