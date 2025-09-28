import { z } from 'zod';


// export const dishesSchema = z.object({
//   restaurantId: z.uuid("Restaurant ID must be a valid UUID."),
//   name: z.string().min(1, "Name is required and must be a non-empty string."),
//   price: z.number().gt(0, "Price must be greater than 0.").lte(10000, "Price must be less than or equal to 10,000."),
// });

const singleDishSchema = z.object({
  name: z.string().min(1, "Dish name is required."),
  price: z.number().positive("Price must be positive."),
});

export const dishesSchema = z.object({
  restaurantId: z.string(),
  dishes: z.array(singleDishSchema).min(1, "At least one dish is required."),
});