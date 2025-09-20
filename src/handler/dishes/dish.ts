import {  Response } from "express";
import { db } from "../../db/connection";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { DishReq,   } from "../../models/admin/admin";
import { dishes } from "../../db/schema/dishes";
import { dishesSchema } from "../../validator/dishes";

export const createDishes = async (req: AuthenticatedRequest, res: Response) => {
  try {
   

    const body = req.body as DishReq
    

      const parsedBody = dishesSchema.safeParse(body)

    if (!parsedBody.success) {
      const errorMessages = parsedBody.error.issues.map((e) => e.message);
      return res.status(400).json({ message: "Validation failed.", errors: errorMessages });
    }

    // Destructure validated data
    const { restaurantId, name, price } = parsedBody.data;

    // Check for existing dish
    const existing = await db
      .select()
      .from(dishes)
      .where(
        eq(dishes.name, name) &&
        eq(dishes.price, price) &&
        eq(dishes.restaurant_id, restaurantId)
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        message: "A dish with this name and price already exists for your hotel.",
      });
    }

    // Create new dish
    const [result] = await db
      .insert(dishes)
      .values({
        name,
        price,
        restaurant_id: restaurantId,
        created_by: req.user?.id,
      })
      .returning({
        name: dishes.name,
      });

    return res.status(201).json({
      message: "Dishes created successfully.",
      dishes: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", error);

    let status = 500;
    let userMessage = "Failed to create dish.";

    // Handle foreign key violation (created_by does not exist)
    if (message.includes("violates foreign key constraint")) {
      status = 400;
      userMessage = "User ID does not exist.";
    }

    return res.status(status).json({
      message: userMessage,
      error: message,
    });
  }
};

export const archiveDish = async (req: AuthenticatedRequest, res: Response) => {
  try {
   

    const dishId = req.params.dishId; // Access the userId parameter


        const dishExisting = await db
          .select({ id: dishes.id })
          .from(dishes)
          .where(eq(dishes.id, dishId))
          .limit(1)
          .execute();

        if (dishExisting.length === 0) {
          return res.status(404).json({ message: `Dish with ID ${dishId} does not exist.` });
        }

      const updateResult = await db
        .update(dishes)
        .set({ archivedAt: new Date() }) // JavaScript Date object, Drizzle will handle conversion
        .where(eq(dishes.id, dishId))
        .execute();

        if (updateResult.rowCount != 0){
          return res.status(200).json({
            message : `dish archived sucessfully`
          })

        }

  
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database error:", error);

    const userMessage = "failed to archive dish.";

    return res.status(500).json({
      message: userMessage,
      error: message,
    });
  }
};