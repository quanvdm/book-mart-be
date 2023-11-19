import mongoose from "mongoose";
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ho_Chi_Minh');
const CommentModel = new mongoose.Schema({
    content: {
        type: String,
        require: true
    },
    User_id: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        require: true 
    },
    Product_id: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        require: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.createdAt = moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss');
            ret.updatedAt = moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss');
            delete ret.id;
        },
    },
})

export default mongoose.model("Comment", CommentModel)