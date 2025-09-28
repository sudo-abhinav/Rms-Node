import {  Response } from "express";
import { db } from "../../db/connection";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
// import {    } from "../../models/admin/admin";
import { dishes } from "../../db/schema/dishes";
import { dishesSchema } from "../../validator/dishes";



export const createDishes = async (req: AuthenticatedRequest, res: Response) => {
  const parsedBody = dishesSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errorMessages = parsedBody.error.issues.map((e) => e.message);
    return res.status(400).json({ message: "Validation failed.", errors: errorMessages });
  }

  const { restaurantId, dishes: dishesList } = parsedBody.data;

  try {
    const result = await db.transaction(async (tx) => {
      // 🔍 Check for duplicates inside transaction
      for (const dish of dishesList) {
        const existing = await tx
          .select()
          .from(dishes)
          .where((
              eq(dishes.name, dish.name),
              eq(dishes.restaurant_id, restaurantId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          throw new Error(`Dish "${dish.name}" already exists for this restaurant.`);
        }
      }

      return await tx
        .insert(dishes)
        .values(
          dishesList.map((dish) => ({
            name: dish.name,
            price: dish.price,
            restaurant_id: restaurantId,
            created_by: req.user?.id,
          }))
        )
        .returning({
          id: dishes.id,
          name: dishes.name,
          price: dishes.price,
        });
    });

    return res.status(201).json({
      message: "Dishes created successfully.",
      dishes: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transaction error:", error);

    let status = 500;
    let userMessage = "Failed to create dishes.";

    if (message.includes("already exists")) {
      status = 409;
      userMessage = message;
    } else if (message.includes("violates foreign key constraint")) {
      status = 400;
      userMessage = "Invalid restaurant or user ID.";
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