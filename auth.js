const jwt = require("jsonwebtoken");
const secret = "ECommerceAPI";

module.exports.createAccessToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    }, secret, { expiresIn: '12h' });
};

module.exports.verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            success: false,
            message: "No token provided or invalid format",
            error: {
                statusCode: 403,
                message: "Authentication required"
            }
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Failed to authenticate token",
                error: {
                    statusCode: 403,
                    message: "Invalid or expired token"
                }
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports.verifyAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin privileges required",
            error: {
                statusCode: 403,
                message: "You do not have permission to access this resource"
            }
        });
    }
    next();
};