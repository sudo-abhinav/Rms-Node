import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import {  RestaurantBody, RestaurantResult } from "../../models/admin/admin";
import { notifyRestaurantCreated } from "../../kafka/producer/producer";
import { Kafka } from "kafkajs";
import { createRestaurantService,checkRestaurantExists  } from "../../services/admin/adminService";
import { restaurantSchema } from "../../validator/restaurant";
const kafkaInit = new Kafka({clientId : 'rma-producer' , brokers: ['localhost:9092']})



export const createRestaurant = async (req: AuthenticatedRequest & Request, res: Response) => {
  try {

    const input = req.body as RestaurantBody
    
    const parsedBody = restaurantSchema.safeParse(input)

    // If validation fails, return error messages to client
    if (!parsedBody.success) {
      const errors = parsedBody.error.issues.map(e => e.message);
      return res.status(400).json({ message: "Validation failed.", errors });
    }

    // Destructure validated data
    const { name, address, latitude, longitude } = parsedBody.data;

    const existing = await checkRestaurantExists(name, address);
    if (existing) {
      return res.status(409).json({
        message: "A restaurant with this name and address already exists."
      });
    }
    
      if (!req.user?.id) {
      return res.status(500).json({ message: "internal server error" });
    }

    // Create restaurant and notify via Kafka
    const result = await createRestaurantService(name, address, latitude, longitude, req.user.id);
    await notifyRestaurantCreated(kafkaInit, result.name);

    // Return success
    return res.status(201).json({
      message: "Restaurant created successfully.",
      restaurant: result as RestaurantResult
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";

    let status = 500;
    let userMessage = "Failed to create restaurant.";

    // Handle foreign key violations
    if (message.includes("violates foreign key constraint")) {
      status = 400;
      userMessage = "User ID does not exist.";
    }
    return res.status(status).json({
      message: userMessage,
      error: message
    });
  }
};

