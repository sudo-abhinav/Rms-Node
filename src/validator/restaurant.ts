import { z } from 'zod';


export const restaurantSchema = z.object({
  name: z.string().min(1, "Name is required and must be a non-empty string."),
  address: z.string().min(1, "Address is required and must be a non-empty string."),
  latitude: z.number().gte(-90).lte(90, "Latitude must be a valid number between -90 and 90."),
  longitude: z.number().gte(-180).lte(180, "Longitude must be a valid number between -180 and 180."),
  // createdBy: z.string().uuid("CreatedBy must be a valid UUID.")
});