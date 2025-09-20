import { Request, Response } from "express";
import { db } from "../db/connection";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import { verifyHashPassword } from "../utils/hasing";
import { generateJwtToken } from "../utils/jwt";
import { restaurants } from "../db/schema/restaurants";
import { restaurantList, RestaurantWithDishes } from "../models/admin/admin";
// import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { dishes } from "../db/export";



export const login = async (req: Request, res: Response) => {
  const { useremail, password } = req.body;
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
      .where(eq(users.email, useremail));
    console.log(result);

    const success = await verifyHashPassword(password, result.password);
    console.log(success);
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

export const fetchAllrestaurants = async (req : Request, res : Response) => {
  try {
    const results = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        address: restaurants.address,
        latitude: restaurants.latitude,
        longitude: restaurants.longitude,
        createdBy: restaurants.createdBy,
      })
      .from(restaurants);

    return res.status(200).json({
      message: "restaurant.",
      restaurant: results as restaurantList[],
    });
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
        address: restaurants.address,
        latitude: restaurants.latitude,
        longitude: restaurants.longitude,
        dishId: dishes.id,
        dishName: dishes.name,
        price: dishes.price,
      })
      .from(restaurants)
      .leftJoin(dishes, eq(dishes.restaurant_id, restaurants.id));

    // Group dishes by restaurant
    const grouped = results.reduce((acc, row) => {
      if (!row.id) return acc; // edge case if left outer join has nulls
      let restaurant = acc.find((r) => r.id === row.id);
      if (!restaurant) {
        restaurant = {
          id: row.id,
          name: row.name,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          dishes: [],
        };
        acc.push(restaurant);
      }
      // Only add if dish exists
      if (row.id != null && row.name != null && row.price != null) {
        restaurant.dishes.push({
          dishId : row.dishId,
          name: row.dishName,
          price: row.price,
        });
      }
      return acc;
    }, [] as RestaurantWithDishes[]);

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
