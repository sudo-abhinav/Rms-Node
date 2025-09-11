import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema/user";
import { userSignup } from "../../models/users/users";
import { hashPassword } from "../../utils/hasing";
import { verifyEmail } from "../../utils/emailVerfier";




export const signUpUser = async (req: Request, res: Response) => {  
  let body: unknown;
  try {
    body = req.body;
  } catch (err) {
    return res.status(400).json({
      message: "Invalid request body.",
      error: "Request body must be JSON."
    });
  }

  const { name, email, password } = body as userSignup;
  const errors: string[] = [];

  // Field-by-field validation
  if (!isNonEmptyString(name)) errors.push("Name is required and must be a non-empty string.");
  if (!isNonEmptyString(email)) errors.push("Email is required and must be a non-empty string.");
  if (!isValidEmail(email)) errors.push("Email must be a valid email address.");
  if (!isNonEmptyString(password)) errors.push("Password is required and must be a non-empty string.");
  if (!isAcceptablePassword(password)) errors.push("Password must be at least 6 characters long.");

  // If validation errors exist, reject immediately
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }
  const result = await verifyEmail(email);
if (result.value) {
    console.log('Email is valid', result);
} else {
   return res.status(400).json({
      message: "enter valid email",
      error: result.error
    })
    console.log('Email is invalid:', result.error);
}

  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User Generated successfully wait For admin approval."
    });
  } catch (error) {
    console.error("User registration error:", error);
    return res.status(500).json({
      message: "Failed to register user.",
      error: "An internal error occurred."
    });
  }
};