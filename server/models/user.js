const mongoose=require('mongoose');

const validator =require('validator');

const jwt=require('jsonwebtoken');

const _= require('lodash');

var Userschema = new mongoose.Schema({email:{
  type:String,
  required:true,
  minlength:1,
  trim:true,
  unique:true,
  validate:{
    validator:validator.isEmail
    ,message:'{VALUE} is not a valid email'
  }
},
  password:{
    type:String,
    require:true,
    minlength:6
  },
  tokens:[{
    access:{
      type:String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
});

Userschema.methods.toJSON = function () {
  var user =this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id','email']);
};

Userschema.methods.generateAuthToken = function () {
  var user=this;
  var access='auth';
  var token =jwt.sign({_id:user._id.toHexString(),access},'abc123').toString();
  user.tokens.push({access,token});
  return user.save().then(()=>{
    return token;
  });
};

Userschema.statics.findByToken = function (token) {
  var User=this;
  var decoded;
  try {
    decoded=jwt.verify(token,'abc123');
  } catch (e) {
    // return new Promise((resolve,reject)=>{
    //   reject();
    return Promise.reject();
  };
  return User.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

var User = mongoose.model('User',Userschema);

//
// var newUser = new User({email:'ajith.aithal20890@gmail.com'});
// //
// // newUser.save().then((doc)=>{
//   console.log(JSON.stringify(doc,undefined,2));
// },(err)=>{
//   console.log('Error iss the folowing:',err);
// });

module.exports={
  User
};
