import { z } from 'zod';


export const restaurantSchema = z.object({
  name: z.string().min(1, "Name is required and must be a non-empty string."),
  // address: z.string().min(1, "Address is required and must be a non-empty string."),
  // latitude: z.number().gte(-90).lte(90, "Latitude must be a valid number between -90 and 90."),
  // longitude: z.number().gte(-180).lte(180, "Longitude must be a valid number between -180 and 180."),
  // createdBy: z.string().uuid("CreatedBy must be a valid UUID.")
});

export const userSignupSchema = z.object({
  name: z.string().min(1, "Name is required and must be a non-empty string."),
  email: z.string().email("Email must be a valid email address."),
  role: z.enum(["sub-admin", "user"], {
    message: "Role must be admin, sub-admin, or user.",
  }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long."),
});

export const addressSchema = z
  .object({
    street: z.string().min(1, "street is required and must be a non-empty string."),
    latitude: z.number().gte(-90).lte(90, "Latitude must be a valid number between -90 and 90."),
    longitude: z.number().gte(-180).lte(180, "Longitude must be a valid number between -180 and 180."),
    restaurantId: z.string().uuid("restaurantId must be a valid UUID.").optional(),
    userId: z.string().uuid("userId must be a valid UUID.").optional(),
  })
  .refine(
    (data) => data.restaurantId || data.userId,
    {
      message: "Either restaurantId or userId must be provided.",
      path: ["restaurantId"], // attach error to restaurantId for clarity
    }
  );