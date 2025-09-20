
import express from "express";

// import {  createDishes, createRestaurant, } from "../../handler/admin/admin";
import { authMiddleware } from "../../middleware/authMiddleware";
import { shouldHaveRole } from "../../middleware/middleware";
import { fetchAllrestaurants } from "../../handler/common";
import { createRestaurant } from "../../handler/restaurant/restaurant";
import { createDishes } from "../../handler/dishes/dish";


export const restaurant = express.Router();


restaurant.post("/restaurant", authMiddleware , shouldHaveRole(['admin' ,'sub-admin' ]) , createRestaurant )

restaurant.post("/dish" , authMiddleware , shouldHaveRole(['admin','sub-admin']), createDishes)

restaurant.get("/restaurant" , authMiddleware , shouldHaveRole(['admin','sub-admin']) ,fetchAllrestaurants )
