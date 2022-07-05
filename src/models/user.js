const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task.js');


const userSchema = new mongoose.Schema({
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is Invalid");
            }
        },
    },
    password: {
        type: String,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("This Password is Invalid");
            }
        },
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer,
    }
},
    { timestamps: true },
);

// creating user relation by task
// virtual - it is not saved in actual database, 
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',  // the relationship establisher - task.owner(_id)
    foreignField: 'owner',  // refer to owner field in REFERED model
})


// we want to hide the private details such as hashedPass and tokens
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    // remove the avatar data - now we have a url setup - conserve the data in the database
    delete userObject.avatar;  // removed from profile image response. (postman)


    return userObject;
}


userSchema.methods.generateAuthToken = async function (email, password) {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SEC)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token;
}


// it is just a function that is associated w ith the model
// statics for method on the UserModel.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to find user')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    // its more secure to pass in same error msg bcoz - it hard to guess&try
    return user;
}


// Hash the plain text password before saving
// schema.pre/post - pre before the event happen || post - as name says
userSchema.pre('save', async function (next) {
    const user = this; // ref this give all access of schema keys and val.

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model("User", userSchema);

module.exports = User;
