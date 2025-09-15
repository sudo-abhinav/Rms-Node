import express, { Response } from "express";

import { AuthenticatedRequest, authMiddleware } from "../../middleware/authMiddleware";
import { shouldHaveRole } from "../../middleware/middleware";
import { signUpUser } from "../../handler/users/user";
import { fetchAllrestaurants, login } from "../../handler/common";

export const userRoute = express.Router();

// Admin login route
userRoute.post("/signup", signUpUser);


userRoute.post("/signin", login )


userRoute.get("/restaurant" , authMiddleware , shouldHaveRole(['user']) , fetchAllrestaurants)

userRoute.get("/profile", authMiddleware, (req :AuthenticatedRequest, res: Response) => {
  const user = req.user; 
  res.json({
    message: `Welcome ${user?.email}`,
    role: user?.role,
    memberSince: user?.createdAt.toISOString(),
  });
});
