import express from "express";
import { login} from "../../handler/common";


export const auth = express.Router();

auth.post("/login", login);