import mongoose from "mongoose";
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Ha_Noi');
const AboutModel = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    }, 
    phone: {
        type: Number,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },

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

export default mongoose.model("About", AboutModel)