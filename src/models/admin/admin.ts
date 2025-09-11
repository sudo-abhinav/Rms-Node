import { PgDoublePrecision } from "drizzle-orm/pg-core";

// Interface for request body
export interface RestaurantBody {
  name: string;
  address: string;
  latitude: string; // Received as string; validated & converted
  longitude: string; // Received as string; validated & converted
  createdBy: string; // User ID (UUID) as string
}

// Interface for returned restaurant (without archived_at and id)
export interface RestaurantResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdBy: string;
}

export interface restaurantList{
  id : string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdBy: string | null;
}

export interface DishesBody{
  restaurantId : string,
  name :string,
  price : number,
}