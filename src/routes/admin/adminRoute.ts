import express, { Response } from "express";

import { ApproveUser, FetchPendingUserList } from "../../handler/admin/admin";
import { AuthenticatedRequest, authMiddleware } from "../../middleware/authMiddleware";
import { shouldHaveRole } from "../../middleware/middleware";

export const adminRoute = express.Router();

// Admin login route




adminRoute.get("/pendingUser" ,authMiddleware, shouldHaveRole(['admin']),FetchPendingUserList)

adminRoute.patch("/approveUser" , authMiddleware, shouldHaveRole(['admin']) ,ApproveUser )






adminRoute.get("/profile", authMiddleware, (req :AuthenticatedRequest, res: Response) => {
  const user = req.user; 
  res.json({
    message: `Welcome ${user?.email}`,
    role: user?.role,
    memberSince: user?.createdAt.toISOString(),
  });
});
