import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../db/connection";
import { users } from "../../db/schema/user";
import { hashPassword } from "../../utils/hasing";
// import { verifyEmail } from "../../utils/emailVerfier";
import { userSignupSchema } from "../../validator/validator";




export const signUpUser = async (req: Request, res: Response) => {  
let body: unknown;
try {
  body = req.body;
} catch {
  return res.status(400).json({
    message: "Invalid request body.",
    error: "Request body must be JSON.",
  });
}

const parsed = userSignupSchema.safeParse(body);

if (!parsed.success) {
  return res.status(400).json({
    message: "Validation failed.",
    errors: parsed.error.issues.map(err => err.message),
  });
}

// const { name, email, role, password } = parsed.data;

//   const result = await verifyEmail(email);
// if (result.value) {
//     console.log('Email is valid', result);
// } else {
//   console.log('Email is invalid:', result.error);
//    return res.status(400).json({
//       message: "enter valid email",
//       error: result.error
//     })
// }

  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await hashPassword(parsed.data.password);

    // Insert the new user
    await db.insert(users).values({
      name : parsed.data.name,
      email: parsed.data.email,
      role : parsed.data.role,
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