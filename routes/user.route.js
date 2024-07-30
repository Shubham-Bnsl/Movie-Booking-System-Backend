import { Router } from "express";
import { createUser, getUser, logIn, logOut, updateProfile, updateUser } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/userAuth.js";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";

const userRoute=Router();

userRoute.post("/signup" ,createUser)
userRoute.post("/login",logIn)
userRoute.get("/getuser",userAuth,getUser)
userRoute.get("/logout",userAuth,logOut)
userRoute.patch("/updateuser",userAuth,updateUser)
userRoute.patch("/updateprofile",userAuth,upload.single("avatar"),updateProfile)


export default userRoute;
