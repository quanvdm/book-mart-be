import express from "express";
import { checkPermission } from "../middlewares/CheckPermission.js";
import { createComment, getAllComment, getCommentByProducts, getOneComment, removeComment, updateComment } from "../controllers/comment.js";
const RouterComment = express.Router();

RouterComment.get("/", getAllComment);
RouterComment.get("/:id", getOneComment);
RouterComment.get("/product/:Product_id", getCommentByProducts);
RouterComment.post("/", createComment);
RouterComment.put("/:id",checkPermission, updateComment);
RouterComment.delete("/:id",checkPermission, removeComment);

export default RouterComment; 