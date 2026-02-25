const multer = require("multer");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const User = require("../Models/userModel");
const { StatusCodes } = require("http-status-codes");

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

const Update = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.updateProfileData = Update.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "firstName", maxCount: 1 },
  { name: "lastName", maxCount: 1 },
  { name: "email", maxCount: 1 },
  { name: "phone", maxCount: 1 },
  { name: "address", maxCount: 1 },
]);

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: "employee" });
    res.json({
      status: "success",
      data: {
        employee: employees,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addTask = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    console.log(user, "🌟🌟🌟");
    user.tasks.push(req.body);
    await user.save();
    res.json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

exports.addEvent = async (req, res, next) => {
  try {
 
    const _id = req.params.empId;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }
    user.events.push(req.body._id);
    await user.save();
    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    console.log(req.body)
    const id = req.params.id;
    console.log(id);
    const file = req.files?.profileImage?.[0];
    if (file) {
      const b64 = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const uploadRes = await cloudinary.uploader.upload(dataURI, { folder: "ems/users" });
      req.body.profileImage = uploadRes.secure_url;
    }
    const user = await User.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true }
    );
    console.log(user);
    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {}
};

exports. updateTaskStatus=async(req,res,next)=>{
  try {
    const _id = req.params.id;
    const user=await User.findOne({_id});
    console.log(user)
    user.tasks.forEach(task=>{
      if(task.id===req.body.taskId){
        task.status=req.body.status
      }
    })
    await user.save();
    res.status(StatusCodes.OK).json({
      status: "success", 
      data: {
        user,
        },
    })
  }catch(error){
     console.log(error)
  }
}