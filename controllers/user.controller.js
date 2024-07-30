import User from "../models/user.model.js";
import uploadOnCloudinary from "../utility/cloudinary.js";
import { errorHandler } from "../utility/errorHandler.js";



const getTokens = async (user) => {
    const accessToken = await user.createAccessToken()
    const refreshToken = await user.createRefreshToken()

    return { accessToken, refreshToken };
}

export const createUser = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            // return res.status(409).json({
            //     message:"User Already Created",
            //     success: false,
            // })
            return next(errorHandler(409, "User Already Created"))
        }

        const newUser = new User({
            userName: userName,
            email: email,
            password: password,
        });

        const { accessToken, refreshToken } = await getTokens(newUser)

        newUser.refreshToken = refreshToken;
        await newUser.save()


        return res.status(201).cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true }).json({
                message: "User created",
                success: true,
                newUser
            })
    } catch (error) {
        // res.status(500).json({
        //     message:"something went wrong",
        //     success: false,
        // })
        // console.log(error)
        next(error)
    }

}


export const logIn = async (req, res, next) => {

    try {
        const { userName, email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return next(errorHandler(404, "User not found!"));
        }

        const isPasswordCorrect = await user.comparePassword(password)


        if (!isPasswordCorrect) {
            return next(errorHandler(401, "Incorrect password"))
        }

        const { accessToken, refreshToken } = await getTokens(user);

        user.refreshToken = refreshToken;

        const updatedUser = await user.save();

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({
                success: true,
                message: "User LoggedIn Successfully",
                data: updatedUser
            })
    } catch (error) {
        next(error)
    }

}

export const getUser =  (req,res,next)=>{

    const user = req?.user;
    try {     
        if(user){
            return res.status(200)
            .json({
                success:true,
                message:"Get User details successfully ",
                data:user
            })
        }

        return next(errorHandler(401,"Unauthorized"))
        
    } catch (error) {
        return next(error)
    }

}

export const logOut= async (req,res,next)=>{
          const user = req.user;

          try {
              if(user){
                 user.refreshToken = ""
                 await user.save();

                 return res.clearCookie("accessToken").clearCookie("refreshToken").json({
                    message:"User Logged Out",
                    success: true
                 })

                 
              }

              return next(errorHandler(401,"Unauthorized "))
          } catch (error) {
            return next(error)
          }
}


export const updateUser = async (req,res,next) =>{

    
    try {
        
        const {email} = req.body
        const user = req.user;
        if(!user){
                return next(errorHandler(401,"Unauthorized"));
        }

        if(email){

           const userWithSameEmail = await User.findOne({email});

           if(userWithSameEmail){
             return next(errorHandler(409,"Try different email"));
           }
        }

        const {password,...rest} = req.body

        if(password){
            user.password = password
            await user.save()
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            rest,
            {new:true}
        )

      

         res.status(200).json({
            success:true,
            message:"User Credentials ",
            data: updatedUser
        })




    } catch (error) {
        next(error)
    }
}

export const updateProfile = async (req,res,next)=>{

        const user = req.user
    try {
        if(!user){
            return next(errorHandler(401,"Unauthorized"))
        }
        
        if(!req.file){
            return next(errorHandler(404,"File not found"))

        }


        const fileData = await uploadOnCloudinary(req.file.path);
        
        user.avatar = fileData.url
        
        const updatedUser =  await user.save();
        

        return res.status(200).json({
            success:true,
            message:"User profile Updated Successfully",
            data:updatedUser
        })
        
        
        


    } catch (error) {
        return next(error)
    }
}