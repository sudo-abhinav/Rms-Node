import { eq } from "drizzle-orm";
import { address, db, restaurants } from "../../db/export";
import { CreateAddressRequest } from "../../models/common";


export const isRestaurantValid = async (restaurantId: string)=>{
  const result = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  return result.length > 0;
}


export const checkRestaurantExists = async (name: string) => {
    const existing = await db
        .select()
        .from(restaurants)
        .where(
            eq(restaurants.name, name)
        )
        .limit(1);
    return existing.length > 0;
};


export async function createAddress(input: CreateAddressRequest) {
  // Ensure at least one of restaurantId or userId is provided
  if (!input.restaurantId && !input.userId) {
    throw new Error("Either restaurantId or userId must be provided");
  }

  const [newAddress] = await db
    .insert(address)
    .values({
      street: input.street,
      latitude: input.latitude,
      longitude: input.longitude,
      restaurantId: input.restaurantId ?? null,
      userId: input.userId ?? null,
    })
    .returning();

  return newAddress;
}