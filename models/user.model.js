import mongoose, { model } from "mongoose"
const { Schema } = mongoose;
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({

    userName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phoneNumber: String,
    password: { type: String, required: true },
    avatar: { type: String, default: "https://user-images.githubusercontent.com/14011726/94132137-7d4fc100-fe7c-11ea-8512-69f90cb65e48.gif" },
    age: Number,
    isAdmin: { type: Boolean, default: false },
    refreshToken: {type: String}
})

userSchema.pre("save", function(next){

    if(!this.isModified("password")){
        return next();
    }

    const salt =  bcrypt.genSaltSync(10);
    const hashedPassword =  bcrypt.hashSync(this.password,salt);
    this.password = hashedPassword;
    next();

})

userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password, this.password);
}

userSchema.methods.createAccessToken = function()
{
   return jwt.sign(
       {_id:this._id, email:this.email},
       process.env.ACCESS_SECRET_KEY,
   );
};

userSchema.methods.createRefreshToken = function()
{
   return jwt.sign(
       {_id:this._id, email:this.email},
       process.env.REFRESH_SECRET_KEY,
   );
};

const User = model("User", userSchema);



export default User;




