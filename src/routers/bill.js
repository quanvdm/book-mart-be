import express from "express";
import { checkPermission } from "../middlewares/CheckPermission.js";
import { createBill, getAllBill, getBillByUser, getBillFollowUser, getOneBill, removeBill, updateBill } from "../controllers/bill.js";
const RouterBill = express.Router();

RouterBill.get("/", getAllBill);
RouterBill.get("/:id", getOneBill);
RouterBill.get("/bill/me", getBillFollowUser);
RouterBill.get("/order/:User_id", getBillByUser);
RouterBill.post("/", createBill);
RouterBill.put("/:id", checkPermission, updateBill);
RouterBill.delete("/:id", checkPermission, removeBill);

export default RouterBill; 