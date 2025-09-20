 import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import expressWinston from "express-winston";
import logger from "../utils/logger";

 export type Role = 'admin' | 'sub-admin' | 'user'; // Adjust as needed


export const logRequestMethod = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.hostname)
    next()
}
export const logHostname = (req: Request, res: Response, next: NextFunction) => {
    next();
}

// export const shouldHaveRole = (requiredRole: Role) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const userRole = req.user?.role;
//     if (userRole !== requiredRole) {
//       return res.status(403).send('Forbidden');
//     }
//     next();
//   };
// }
// export default {logHostname , logRequestMethod}
export const shouldHaveRole = (requiredRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
};



export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
});