import {db ,users , restaurants } from '../../db/export'
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

export const checkRestaurantExists = async (name: string, address: string) => {
    const existing = await db
        .select()
        .from(restaurants)
        .where(
            eq(restaurants.name, name)
            && eq(restaurants.address, address)
        )
        .limit(1);
    return existing.length > 0;
};

export const createRestaurantService = async (
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    createdBy: string
) => {
    const [result] = await db.insert(restaurants)
        .values({
            name ,
            address,
            latitude,
            longitude,
            createdBy: createdBy.toString()
        })
        .returning({
            id: restaurants.id,
            name: restaurants.name,
            address: restaurants.address,
            latitude: restaurants.latitude,
            longitude: restaurants.longitude,
            createdBy: restaurants.createdBy,
        });
    return result;
};