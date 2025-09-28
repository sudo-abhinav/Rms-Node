import {db ,users , restaurants ,  address } from '../../db/export'
import { eq } from 'drizzle-orm';
import { userInfo } from '../../models/admin/admin';

export const getUserByEmail = async (useremail: string): Promise<userInfo> => {
    try {
        const [result] = await db
            .select({
                id: users.id,
                password: users.password,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            })
            .from(users)
            .where(eq(users.email, useremail));

        if (!result) {
            throw new Error('User not found');
        }
        
        return {
            id: result.id,
            password: result.password,
            email: result.email,
            role: result.role,
            createdAt: result.createdAt || new Date()
        };
    } catch{
        throw new Error('Failed to fetch user by email');
    }
};



export const createRestaurantService = async (
    name: string,
    createdBy: string
) => {
    const [result] = await db.insert(restaurants)
        .values({
            name ,
            createdBy: createdBy.toString()
        })
        .returning({
            id: restaurants.id,
            name: restaurants.name,
            createdBy: restaurants.createdBy,
        });
    return result;
};

export async function fetchRestaurantsByUserId(userId: string) {
  return await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      address: address.street,
      latitude: address.latitude,
      longitude: address.longitude,
      createdBy: restaurants.createdBy,
    })
    .from(restaurants)
    .leftJoin(address, eq(address.restaurantId, restaurants.id))
    .where(eq(restaurants.createdBy, userId));
}