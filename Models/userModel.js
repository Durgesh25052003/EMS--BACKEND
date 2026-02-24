const mongoose = require('mongoose');
const bcrypt=require('bcrypt')


// firstName: '',
// lastName: '',
// email: '',
// phone: '',
// position: '',
// department: '',
// employeeId: '',
// joiningDate: '',
// salary: '',
// address: '',
// city: '',
// state: '',
// zipCode: '',
// country: '',
// status: 'active',
// password: '',
// profileImage: null

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required']
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
      },
      phone: {
        type: String,
        trim: true
      },
      profileImage: {
        type: String,  // URL to stored image
        default: ''
      },
         
      // Employment Details
      employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
      },
      role:{
        type:String,
        default:'employee'
      },
      position: {
        type: String,
        required: [true, 'Position is required']
      },
      department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales']
      },
      joiningDate: {
        type: Date,
        required: [true, 'Joining date is required']
      },
      salary: {
        type: Number,
        required: [true, 'Salary is required']
      },
      status: {
        type: String,
        enum: ['active', 'onLeave', 'terminated', 'probation'],
        default: 'active'
      },
    
      // Address Information
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      
      // Account Information
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false  // Don't return password in queries by default
      },
      confirmPassword: {
        type: String,
      },
      passwordChanged: {
        type: Boolean,
        default: false
      },
      passwordResetToken: String,
      passwordResetExpires: Date,
      
      // System Fields
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      tasks:[{
        type:Object,
      }],
      events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      }],
      totalLeaves:{
        type:Number,
        default:10
      },
      leaveTaken:{
        type:Number,
        default:0
      },
    //   createdBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'  // Reference to admin user who created this employee
    //   }
});


userSchema.pre('save', async function(next) {
    // Only run this if password is actually modified
    if (!this.isModified('password')) return next();
    
    // If password exists, hash it
    if (this.password) {
        const saltRounds = 10;
        // setting confirm password for sending it into email
        this.confirmPassword = this.password;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
    }
    
    next();
});

userSchema.methods.comparePassword = async function (passwordEnter) {
  return await bcrypt.compare(passwordEnter, this.password);
};

userSchema.methods.isPasswordResetTokenValid = function() {
  return this.passwordResetExpires > Date.now();
};


const User = mongoose.model('User', userSchema);

module.exports = User;
