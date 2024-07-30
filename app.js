import express from "express"
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import errorMiddlewareHandler from "./middlewares/error.MiddlewareHandler.js";


const app = express();

app.use(express.json()) 

app.use(cookieParser())

app.use('/user',userRoute)

app.use(errorMiddlewareHandler)


export default app
