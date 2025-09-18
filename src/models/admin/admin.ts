
// Interface for request body
export interface RestaurantBody {
  name: string;
  address: string;
  latitude: number; // Received as string; validated & converted
  longitude: number; // Received as string; validated & converted
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

export interface userInfo{
  id : string;
  password :string;
  email : string;
  role : string   | null;
  createdAt  :Date
}
  //  id: number;
  //   password: string;
  //   email: string;
  //   role: string;
  //   createdAt: Date;

export type RestaurantWithDishes = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  dishes: { 
    dishId:string | null;
    name: string | null;
    price: number | null;
          }[];
};