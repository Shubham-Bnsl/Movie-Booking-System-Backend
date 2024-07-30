import jwt from "jsonwebtoken";
import { errorHandler } from "../utility/errorHandler.js";
import User from "../models/user.model.js";

export const userAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        if (!accessToken && !refreshToken) {
            return next(errorHandler(401, "Unauthorized User"));
        }

        if (accessToken) {
            try {
                const verifyAccessToken = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY);
                
                if (verifyAccessToken) {
                    const { email } = verifyAccessToken;
                    const user = await User.findOne({ email });
                    if (!user) {
                        return next(errorHandler(401, "Unauthorized"));
                    }

                    req.user = user;
                    return next();
                }
            } catch (error) {
                console.log("Access Token Error: ", error);
            }
        }

        if (refreshToken) {
            try {
                const verifyRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
                
                if (verifyRefreshToken) {
                    const { email } = verifyRefreshToken;
                    const user = await User.findOne({ email });

                    if (!user || user.refreshToken !== refreshToken) {
                        return next(errorHandler(401, "Unauthorized"));
                    }

                    const newAccessToken = user.createAccessToken();
                    const newRefreshToken = user.createRefreshToken();
                    user.refreshToken = newRefreshToken;
                    await user.save();

                    res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' })
                       .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });

                    req.user = user;
                    return next();
                }
            } catch (error) {
                console.log("Refresh Token Error: ", error);
            }
        }

        return next(errorHandler(401, "Unauthorized"));
    } catch (error) {
        next(error);
    }
};
