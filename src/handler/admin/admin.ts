import { Request, Response } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema/user";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { addressSchema } from "../../validator/validator";
import {  createAddress, isRestaurantValid } from "../../services/address/address";


  export const FetchPendingUserList = async (req : Request , res :Response) =>{
    try{
        const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        adminApproved: users.adminApproved
      })
      .from(users)
      .where(eq(users.adminApproved, false));
 return res.status(200).json({
      message: 'Pending user list retrieved successfully.',
      users: result
    });
  } catch (error) {
    console.error('Failed to fetch pending users:', error);
    return res.status(500).json({
      message: 'Failed to retrieve pending users.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};


export const ApproveUser = async(req : Request , res :Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({
      message: 'User ID is required in query parameters'
    });
  }

  try {
    // Check if user exists and is not already approved
    const [existingUser] = await db
      .select({
        id: users.id,
        adminApproved: users.adminApproved
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (existingUser.adminApproved) {
      return res.status(400).json({
        message: 'User is already approved'
      });
    }

    // Update user approval status
    const [updatedUser] = await db
      .update(users)
      .set({ adminApproved: true })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        adminApproved: users.adminApproved
      });

    return res.status(200).json({
      message: 'User approved successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Failed to approve user:', error);
    return res.status(500).json({
      message: 'Failed to approve user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export const addAddress = async(req :AuthenticatedRequest & Request , res : Response) =>{


  const addressBody = addressSchema.safeParse(req.body)
   if (!addressBody.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: addressBody.error.issues,
    });
  }
 

   const { street , latitude ,longitude , restaurantId } = addressBody.data;

     if (req.user?.role === "admin" && "sub-admin" && !restaurantId) {
    return res.status(400).json({
      message: "restaurantId is mandatory for users with role 'admin' and 'sub-admin'",
    });
  }

  if (restaurantId) {
    const valid = await isRestaurantValid(restaurantId);
    if (!valid) {
      return res.status(404).json({ message: "Invalid restaurantId" });
    }
  }

    // const userId = restaurantId ? undefined : req.user?.id;

      try {
    const newAddress = await createAddress({
      street,
      latitude,
      longitude,
      restaurantId: req.user?.role !== "user" ? restaurantId : undefined,
      userId: req.user?.role === "user" ? req.user.id : undefined,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Failed to add address:", error);
    return res.status(500).json({
      message: "Failed to add address",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }





}

