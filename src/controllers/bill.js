import Bill from "../models/bill.js";
import BillSchema from "../validates/bill.js";
import Product from "../models/product.js"
import dotenv from 'dotenv'
import nodemailer from "nodemailer"
dotenv.config()
const { MAIL_USERNAME } = process.env
const { MAIL_PASSWORD } = process.env
const { MAIL_FROM_ADDRESS } = process.env

export const getAllBill = async (req, res) => {
    try {
        const bill = await Bill.find()
        if (bill.length === 0) {
            return res.status(404).json({
                message: "Không có đơn hàng nào",
            });
        }
        return res.status(200).json({
            message: "thành công",
            data: bill
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const getOneBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
        if (!bill) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng nào",
            });
        }
        return res.status(200).json({
            message: "thành công",
            data: bill
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
export const getBillByUser = async function (req, res) {
    try {
        const bill = await Bill.find({ User_id: req.params.User_id });
        if (bill.length === 0) {
            return res.status(404).json({
                message: "bạn chưa có đơn hàng nào",
            });
        }
        return res.status(200).json({
            message: "thành công",
            data: bill
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
export const createBill = async function (req, res) {
    try {
        const { error } = BillSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((err) => err.message);
            return res.status(404).json({
                message: errors,
            });
        }

        const orderedItems = req.body.items.map(async (item) => {
            const product = await Product.findById(item._id);
            let sizeFound = false;
            for (const size of product.sizes) {
                if (size.size === item.size) {
                    sizeFound = true;
                    if (size.quantity < item.quantity) {
                        return res.status(404).json({
                            message: "Sản phẩm không đủ số lượng để bán",
                        });
                    }
                    size.quantity -= item.quantity;
                    if (size.quantity === 0) {
                        product.sizes = product.sizes.filter((s) => s.size !== size.size);
                    }
                    break;
                }
            }
            if (!sizeFound) {
                return res.status(404).json({
                    message: "Sản phẩm không có size này để bán",
                });
            }
            product.quantity -= item.quantity;
            await product.save();
            return {
                name: product.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            };
        });

        const items = await Promise.all(orderedItems);
        const validItems = items.filter((item) => item !== null);

        if (validItems.length === 0) {
            return res.status(404).json({
                message: "Không đủ số lượng sản phẩm để bán",
            });
        }

        const billData = {
            ...req.body,
            items: validItems,
        };

        const bill = await Bill.create(billData);

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: MAIL_USERNAME,
                pass: MAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: MAIL_FROM_ADDRESS,
            to: req.body.email,
            subject: "Cảm ơn bạn đã mua hàng",
            html: `
            <div style="background-color: #f5f5f5; padding: 20px;">
                <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
                <h1 style="text-align: center; margin-bottom: 0;">Cảm ơn bạn đã mua hàng</h1>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <p>Xin chào <strong>${req.body.name}</strong>,</p>
                <p>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được xác nhận và sẽ được vận chuyển trong thời gian sớm nhất.</p>
                <p>Thông tin đơn hàng:</p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${validItems.map((item) => `
                    <li style="margin-bottom: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                        <img src="${item.image}" alt="" style="max-width: 100%; height: auto;"/>
                        <h3 style="margin-top: 0;">${item.name}</h3>
                        <p style="margin-bottom: 5px;">Size: ${item.size}</p>
                        <p style="margin-bottom: 5px;">Số lượng: ${item.quantity}</p>
                        <p style="margin-bottom: 0;">Đơn giá: ${item.price}</p>
                    </li>
                `).join('')}
            </ul>
            <p>Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ của chúng tôi</p>
        </div>
    </div>
`,
        };
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Tạo đơn hàng thành công",
            data: bill,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const getBillFollowUser = async (req, res) => {
    try {
        const deliveryPedding = await Bill.find({ User_id: req.query.id }).count({
            status: "Chờ duyệt",
        });
        const delivering = await Bill.find({ User_id: req.query.id }).count({
            status: "Đang giao",
        });
        const deliverySuccess = await Bill.find({ User_id: req.query.id }).count({
            status: "Giao thành công",
        });
        const deliveryCount = await Bill.find({ User_id: req.query.id }).count();
        const bill = await Bill.find({ User_id: req.query.id }).sort({
            createdAt: -1,
        });
        if (bill.length === 0) {
            return res.status(200).json({
                message: "Không có đơn hàng nào",
                deliveryPedding: 0,
                delivering: 0,
                deliverySuccess: 0,
                deliveryCount: 0,
                data: bill,
            });
        }
        return res.status(200).json({
            message: "Thành công",
            deliveryPedding,
            delivering,
            deliverySuccess,
            deliveryCount,
            data: bill,
        });
    } catch (error) {
        return res.status(200).json({
            message: error.message,
            data: [],
        });
    }
};

export const updateBill = async function (req, res) {
    try {
        const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bill) {
            return res.status(404).json({
                message: "Cập nhật đơn hàng không thành công",
            });
        }
        return res.status(200).json({
            message: "Cập nhật đơn hàng thành công",
            data: bill,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const removeBill = async function (req, res) {
    try {
        const bill = await Bill.findOneAndDelete({
            _id: req.params.id,
            status: 'đang chờ duyệt',
        });
        if (bill) {
            return res.status(200).json({
                message: "hủy đơn hàng thành công",
                bill,
            });
        } else {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng hoặc đơn hàng đã được duyệt",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
