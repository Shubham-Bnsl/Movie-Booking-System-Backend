import mongoose from "mongoose"
import 'dotenv/config'

const connectDB = async() =>{
        
    try {
        
        const database = await mongoose.connect(process.env.MONGODB_URL);

        console.log("DB Connected Successfully");

    } catch (error) {
        console.log(error);
    }
}

export default connectDB;