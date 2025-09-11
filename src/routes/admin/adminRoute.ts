import express, { Response } from "express";

import { ApproveUser, createDishes, createRestaurant, FetchPendingUserList } from "../../handler/admin/admin";
import { AuthenticatedRequest, authMiddleware } from "../../middleware/authMiddleware";
import { shouldHaveRole } from "../../middleware/middleware";
import { fetchAllrestaurants, login, testReq } from "../../handler/common";

export const adminRoute = express.Router();

// Admin login route
adminRoute.post("/login", login);

adminRoute.get("/test" , testReq)


adminRoute.get("/pendingUser" ,authMiddleware, shouldHaveRole(['admin']),FetchPendingUserList)

adminRoute.patch("/approveUser" , authMiddleware, shouldHaveRole(['admin']) ,ApproveUser )


adminRoute.post("/restaurant", authMiddleware , shouldHaveRole(['admin' ,'sub-admin' ]) , createRestaurant )

adminRoute.post("/dish" , authMiddleware , shouldHaveRole(['admin','sub-admin']), createDishes)
adminRoute.get("/restaurant" , authMiddleware , shouldHaveRole(['admin','sub-admin']) ,fetchAllrestaurants )



adminRoute.get("/profile", authMiddleware, (req :AuthenticatedRequest, res: Response) => {
  const user = req.user; 
  res.json({
    message: `Welcome ${user?.email}`,
    role: user?.role,
    memberSince: user?.createdAt.toISOString(),
  });
});
