import { DrizzleError, eq } from 'drizzle-orm';
import { db } from './connection';
import { users } from './schema/user';

/**
 * Retrieves all user data from the database
 * @returns Promise<User[]> Array of user objects
 */
export async  function getAllUsers() {
    try {
        const userEmail = await db.select({
            email : users.email
        }).from(users).where(eq(users.adminApproved, true))
      return userEmail.map(row => row.email )
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}



