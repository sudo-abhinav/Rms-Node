 export interface UserJwtPayload {
        id: string;
        email: string;
        role: string;
        createdAt : Date
    }

export interface CreateAddressRequest {
  street: string;
  latitude: number;
  longitude: number;
  restaurantId?: string;
  userId?: string;
}