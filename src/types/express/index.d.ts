import { UserJwtPayload } from '../../models/common';

declare namespace Express {
  export interface Request {
    user?: UserJwtPayload;
  }
}
// TODO Declaration Merging for Express
// Extends Express's built-in Request type to allow req.user.
// Makes TypeScript aware of the user property.
// Prevents TS errors and provides autocomplete + type safety.