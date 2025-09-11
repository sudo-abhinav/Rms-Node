import { Request, Response } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema/user";
import { eq } from "drizzle-orm";
import { verifyHashPassword } from "../../utils/hasing";
import { generateJwtToken } from "../../utils/jwt";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { error } from "console";
import { restaurants } from "../../db/schema/restaurants";
import { DishesBody, RestaurantBody, restaurantList, RestaurantResult, userInfo } from "../../models/admin/admin";
import { dishes } from "../../db/schema/dishes";
import { notifyRestaurantCreated } from "../../kafka/producer/producer";
import { Kafka } from "kafkajs";
import { createRestaurantService,checkRestaurantExists , getUserByEmail } from "../../services/admin/adminService";
const kafkaInit = new Kafka({clientId : 'rma-producer' , brokers: ['localhost:9092']})

export const login = async (req: Request, res: Response) => {
  const { useremail, password } = req.body;
  try {
    const result: userInfo  = await getUserByEmail(useremail);

    console.log(result);
   

    const success = await verifyHashPassword(password, result.password);
    console.log(success)
    let jwtToken: string | null = null;
    if (result.email && result.role && result.createdAt) {
      jwtToken = generateJwtToken(result.id,result.email, result.role, result.createdAt);
    } else {
      res.status(401).json({ message: "Invalid credentials not able to generate token" });
      return;
    }

    if (result.password.length > 0 && success && jwtToken) {
      res.status(200).json({ message: "Login successful", token: jwtToken });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
    // res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};




export const createRestaurant = async (req: AuthenticatedRequest & Request , res: Response) => {

  

  const { name, address, latitude, longitude, createdBy } = req.body as RestaurantBody;
  const errors: string[] = [];

  
  // Helper functions for validation
  const isUuid = (value: any) => typeof value === 'string' && value.length === 36;
  const isNonEmptyString = (value: any) => typeof value === 'string' && value.trim() !== '';
  const isLatitude = (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num >= -90 && num <= 90;
  };
  const isLongitude = (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num >= -180 && num <= 180;
  };

  // Field-by-field validation
  if (!isNonEmptyString(name)) errors.push("Name is required and must be a non-empty string.");
  if (!isNonEmptyString(address)) errors.push("Address is required and must be a non-empty string.");
  if (!isLatitude(latitude)) errors.push("Latitude must be a valid number between -90 and 90.");
  if (!isLongitude(longitude)) errors.push("Longitude must be a valid number between -180 and 180.");
  if (!isUuid(createdBy)) errors.push("CreatedBy must be a valid UUID.");

  // If validation errors exist, reject immediately
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  // Attempt to insert restaurant
  try {

    const existing = await checkRestaurantExists(name, address);

    if (existing) {
      return res.status(409).json({
        message: "A restaurant with this name and address already exists."
      });
    }

    const result = await createRestaurantService(name,address, latitude , longitude , req.user.id)


      await notifyRestaurantCreated(kafkaInit ,result.name )

    return res.status(201).json({
      message: "Restaurant created successfully.",
      restaurant: result as RestaurantResult,
    });
    
  } catch (error: unknown) {
    console.log(error)
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", error);

    let status = 500;
    let userMessage = "Failed to create restaurant.";

    // Handle foreign key violation (created_by does not exist)
    if (message.includes("violates foreign key constraint")) {
      status = 400;
      userMessage = "User ID does not exist.";
    }
    // Handle other database errors

    return res.status(status).json({
      message: userMessage,
      error: message
    });
  }
};




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


export const createDishes = async(req: AuthenticatedRequest, res: Response) =>{

    const {restaurantId, name, price } = req.body as DishesBody;
      const errors: string[] = [];


     
  // Helper functions for validation
  const isUuid = (value: any) => typeof value === 'string' && value.length === 36;
  const isNonEmptyString = (value: any) => typeof value === 'string' && value.trim() !== '';
  const PriceCheck = (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num > 0 && num < 10000;
  };
  const isLongitude = (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num >= -180 && num <= 180;
  };

  // Field-by-field validation
  if (!isNonEmptyString(name)) errors.push("Name is required and must be a non-empty string.");
  if (!isUuid(restaurantId)) errors.push("restaurant id  is required and must be a non-empty string.");
  if (!PriceCheck(price)) errors.push("price must be a valid number");

  // If validation errors exist, reject immediately
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

    try {
    // adding existing check 
     const existing = await db
      .select()
      .from(dishes)
      .where(
      eq(dishes.name, name)
      && eq(dishes.price, price)
      && eq(dishes.restaurant_id, restaurantId)
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        message: "A dish with this name and price already exists for your hotel."
      });
    }


      const [result] = await db.insert(dishes).values({
       name :name,
       price : price,
       restaurant_id: restaurantId,
       created_by : req.user?.id,
    }).returning({
        name:dishes.name
      });

    return res.status(201).json({
      message: "dishes created successfully.",
      restaurant: result as RestaurantResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", error);

    let status = 500;
    let userMessage = "Failed to create restaurant.";

    // Handle foreign key violation (created_by does not exist)
    if (message.includes("violates foreign key constraint")) {
      status = 400;
      userMessage = "User ID does not exist.";
    }
    // Handle other database errors

}
}