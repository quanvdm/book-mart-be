import HashTag from "../models/hashtag.js";
import HashTagSchema from "../validates/hashtag.js";
import Product from "../models/product.js";

export const getAllHashTag = async (req, res) => {
    try {
        const tags = await HashTag.find().populate("products");
        if (tags.length === 0) {
            return res.json({
                message: "Không có hashtag nào",
            });
        } 
        return res.status(200).json({
            message: "thành công",
            data: tags
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const getOneHashTag = async function (req, res) {
    try {
        const tag = await HashTag.findById(req.params.id).populate("products");
        if (!tag) {
            return res.json({
                message: "Không có hashtag nào",
            });
        }
        return res.status(200).json({
            message: "thành công",
            data: tag
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const createHashTag = async function (req, res) {
    try {
        const { name } = req.body
        const { error } = HashTagSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((err) => err.message);
            return res.status(400).json({
                message: errors,
            });
        }
        const HashTagExists = await HashTag.findOne({ name });
        if (HashTagExists) {
            return res.status(400).json({
                message: "hashtag đã tồn tại",
            });
        }
        const tag = await HashTag.create(req.body);
        if (!tag) {
            return res.status(400).json({
                message: "Không thêm được hashtag",
            });
        }
        return res.status(200).json({
            message: "Thêm hashtag thành công",
            data: tag
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const updateHashTag = async function (req, res) {
    try {
        const { name } = req.body
        const HashTagExists = await HashTag.findOne({ name });
        if (HashTagExists) {
            return res.status(400).json({
                message: "hashtag đã tồn tại",
            });
        }
        const tag = await HashTag.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tag) {
            return res.status(400).json({
                message: "Cập nhật hashtag không thành công",
            });
        }
        return res.status(200).json({
            message: "Cập nhật hashtag thành công",
            data: HashTag
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const removeHashTag = async function (req, res) {
    try {
        // Xoá hashtag và bài viết liên quan
        const tag = await HashTag.findByIdAndDelete(req.params.id)
        if (!tag) {
            return res.status(400).json({
                message: "Xóa hashtag thất bại",
            });
        } else {
            const product = await Product.deleteMany({ HashTagId: req.params.id })
            if (!product) {
                return res.status(400).json({
                    message: "Xóa bài viết liên quan thất bại",
                });
            } else {
                return res.status(200).json({
                    message: "Đã xoá hashtag và bài viết liên quan thành công!",
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};