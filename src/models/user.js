const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String, 
    unique: true,
    trim: true,
    lowercase: true,
    validate(value){
      if (!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    },
    required: true
  },
  age: {
    type: Number,
    default: 0,
    validate(value){
      if (value < 0){
        throw new Error('Age must be a positive number')
      }
    }
  },
  password: {
    type: String,
    minlength: 7,
    trim: true,
    validate(value){
      if(value.toLowerCase().includes('password')) throw new Error('Your password cannot contain "password". Sorry !')
    },
    required: true,
  },
  avatar: {
    type: Buffer
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: false
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
})

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = await jwt.sign({ _id: user._id.toString() }, 'thisIsNotSatisfyingOrStandard')

  user.tokens = user.tokens.concat({ token })
  await user.save()
  
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  for (let field of ['password', 'tokens', 'avatar']){
    delete userObject[field]
  }
  return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) throw new Error('Unable to login')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Unable to login')

  return user
}

// Password hash middleware
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8)
  next()
})
// Delete cascade middleware
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User