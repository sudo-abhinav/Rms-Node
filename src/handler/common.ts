import { Request, Response } from "express";
import { db } from "../db/connection";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import { verifyHashPassword } from "../utils/hasing";
import { generateJwtToken } from "../utils/jwt";
import { restaurants } from "../db/schema/restaurants";
import { restaurantList } from "../models/admin/admin";
import { AuthenticatedRequest } from "../middleware/authMiddleware";


export const testReq = async (req: Request, res: Response) => {
  console.log({
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
    method: req.method,
    path: req.path
  });

  

  console.log(req)
  
  res.status(200).json({ message: "Request logged successfully" });
};

export const login = async (req: Request, res: Response) => {
  const { useremail, password } = req.body;
  try {
    const [result] = await db
      .select({id :users.id, password: users.password , email : users.email  , role : users.role , createdAt : users.createdAt})
      .from(users)
      .where(eq(users.email, useremail));
    console.log(result);
   

    const success = await verifyHashPassword(password, result.password);
    console.log(success)
    let jwtToken: string | null = null;
    if (result.email && result.role && result.createdAt) {
      jwtToken = generateJwtToken(result.id , result.email, result.role, result.createdAt);
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


export const fetchAllrestaurants = async (req : Request , res :Response)=>{

  try{
     const results = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        address : restaurants.address,
        latitude : restaurants.latitude,
        longitude : restaurants.longitude,
        createdBy :restaurants.createdBy
      })
      .from(restaurants);

      return res.status(200).json({
      message: "restaurant.",
      restaurant: results as restaurantList[],
    });
  }catch(error){
     console.error('Failed to fetch restaurants:', error);
    res.status(500).json({
      message: 'Failed to retrieve restaurants.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  }
