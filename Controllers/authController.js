const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const Email = require("../utils/Email");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const creatToken = (user) => {
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "90d" });
  return token;
};

// image upload
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  try {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images"), false);
    }
  } catch (error) {
    console.log(error);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserData = upload.fields([
  { name: "profileImage", maxCount: 1 },
]);

exports.create = async (req, res, next) => {
  try {
    const file = req.files?.profileImage?.[0];
    if (file) {
      const b64 = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const uploadRes = await cloudinary.uploader.upload(dataURI, { folder: "ems/users" });
      req.body.profileImage = uploadRes.secure_url;
    }
    console.log("🤞🤞🤞🏎️",req.body)
    if (!req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required"
      });
    }
    const user = await User.create({
      ...req.body,
    });
    const email = new Email();
    email.sendMailWelcome(
      user.email,
      "Welcome to the Company",
      user.firstName,
      user.email,
      user.confirmPassword,
      "https://ems-ctfv0iui7-durgesh25052003s-projects.vercel.app/"
    ).catch(err => console.log('Email send failed:', err?.message || err));
    
    return res.status(200).json({
      status: "success",
      user
    });
  } catch (error) {
    console.log("✅✅✅");
    console.log(error.message);
  }
};

exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password").exec();
    console.log("🙌🙌🙌")
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "Unauthorized User",
      });
    }
    const token = creatToken(user);

    // Modified cookie options
    // In the Login function
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,  // Set to false for HTTP in development
      sameSite: 'lax',  // Changed from 'none' since we're not using secure
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Send response after setting cookie
    return res.status(200).json({
      status: "success",
      user,
      token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Login failed"
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  
  try {
    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      console.log('Token from cookie🌟🌟:', req.cookies.token);
      token = req.cookies.token;
    }
    // Then check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log('Token from header🌟🌟:', token);
    }

    if (!token) {
      console.log('No token found in either cookies or headers');
      return res.status(401).json({
        status: "Unauthorized",
        message: "Please log in to access this resource"
      });
    }

    console.log('Final token being used:', token);
    const secretKey = process.env.SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: "Unauthorized",
      message: "Invalid or expired token"
    });
  }
};

exports.verifyRole = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "User role not found"
    });
  }
  
  return res.status(200).json({
    status: "success",
    role: req.user.role,
  });

};

exports.forgetPassword = async (req, res, next) => {
  try {
    const email = req.body;
    console.log(email);
    const user = await User.findOne(email);
    console.log(user, "🌟🌟🌟🌟");
     // Generate reset token
     const resetToken = creatToken(user);
    
     // Save reset token to user document
     user.passwordResetToken = resetToken;
     user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
     await user.save({ validateBeforeSave: false });

     const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
 
    const emailObj = new Email();
    await emailObj.sendMailForgetPassword(
      user.email,
      "Request for Password Reset",
      user.firstName,
      resetURL
    );
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user by reset token
    const user = await User.findOne({
      passwordResetToken: token,
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token has expired
    if (!user.isPasswordResetTokenValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token has expired'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Password successfully reset'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password'
    });
  }
};
