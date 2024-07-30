import { v2 as cloudinary } from 'cloudinary';
import { errorHandler } from './errorHandler.js';
import fs from "fs"

cloudinary.config({ 
    cloud_name: 'dsm1yyzog', 
    api_key: '593144671945936', 
    api_secret: 'XpMzEtw_PjPKFz2ArGtcn9P3hYM'
});

// cloudinary.config({ 
//     cloud_name: 'dsm1yyzog', 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const uploadOnCloudinary= async(filePath,next)=>{
    
    try {
        
        if(!filePath){
            return next(errorHandler(404,"file is not provided"))    
        }
        
        const fileUploaded = await cloudinary.uploader.upload(filePath,{resource_type:"auto"})
        
        fs.unlinkSync(filePath)
        
        
        return fileUploaded;
        
    } catch (error) {
        console.log(error)
        fs.unlinkSync(filePath)
        return next(errorHandler(500, error.message))

    }
}

export default uploadOnCloudinary;