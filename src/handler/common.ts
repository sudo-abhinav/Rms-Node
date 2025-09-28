import { Request, Response } from "express";
import { db } from "../db/connection";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import { verifyHashPassword } from "../utils/hasing";
import { generateJwtToken } from "../utils/jwt";
import { restaurants } from "../db/schema/restaurants";
import { restaurantList, RestaurantWithDishes } from "../models/admin/admin";
// import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { address, dishes } from "../db/export";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { fetchRestaurantsByUserId } from "../services/admin/adminService";



export const login = async (req: Request, res: Response) => {
  const { useremail, password } = req.body;
  logger.info(`user email ${useremail} and ${password}`)
  try {
    const [result] = await db
      .select({
        id: users.id,
        password: users.password,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
       .where((
      eq(users.email, useremail),
      eq(users.adminApproved, true)
    )
  );

    console.log(result.password , result.password );

    const success = await verifyHashPassword(password, result.password);

    let jwtToken: string | null = null;
    if (result.email && result.role && result.createdAt) {
      jwtToken = generateJwtToken(
        result.id,
        result.email,
        result.role,
        result.createdAt
      );
    } else {
      res
        .status(401)
        .json({ message: "Invalid credentials not able to generate token" });
      return;
    }

    if (success && jwtToken) {
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

export const fetchAllrestaurantsWithRole = async (req : AuthenticatedRequest, res : Response) => {
  try {

      if (!req.user?.id) {
        // TODO this is just for remove error in eq because in authrequest id is string 
      return res.status(401).json({ message: "Unauthorized: user id missing" });
    }
    const results = await fetchRestaurantsByUserId(req.user.id)

    return res.status(200).json({
      message: "restaurant.",
      restaurant: results as restaurantList[],
    })
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    res.status(500).json({
      message: "Failed to retrieve restaurants.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const fetchAllrestaurantsWithDishes = async (
  req: Request,
  res: Response
) => {
  try {
    const results = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        address: address.street,
        latitude: address.latitude,
        longitude: address.longitude,
        dishId: dishes.id,
        dishName: dishes.name,
        price: dishes.price,
      })
      .from(restaurants).leftJoin(address, eq(address.restaurantId, restaurants.id))
      .leftJoin(dishes, eq(dishes.restaurant_id, restaurants.id));


       // Group dishes by restaurant
   const grouped = results.reduce((acc, row) => {
      if (!row.id) return acc; // safety for leftJoin edge cases

      let restaurant = acc.find((r) => r.id === row.id);
      if (!restaurant) {
        restaurant = {
          id: row.id,
          name: row.name,
          address: row.address ?? "",      
          latitude: row.latitude ?? 0,   
          longitude: row.longitude ?? 0,   
          dishes: [],
        };
        acc.push(restaurant);
      }

      if (row.dishId != null) {
        restaurant.dishes.push({
          dishId: row.dishId,
          name: row.dishName,
          price: row.price,
        });
      }

      return acc;
    }, [] as RestaurantWithDishes[]);

    // }, [] as RestaurantWithDishes[]);

    return res.status(200).json({
      message: "Restaurants and dishes",
      restaurants: grouped,
    });
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    res.status(500).json({
      message: "Failed to retrieve restaurants.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
