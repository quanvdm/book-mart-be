import joi from "joi";
const itemSchema = joi.object({
    _id: joi.any(),
    image: joi.string().required(),
    name: joi.string().required(),
    price: joi.number().required(),
    size: joi.number().required(),
    quantity: joi.number().required(),
});
const BillSchema = joi.object({
    name: joi.string().required().messages({
        "string.empty": 'Trường tên không được để trống',
        "any.required": 'Trường tên là bắt buộc',
    }),
    email: joi.string().email().required().messages({
        "string.empty": 'Trường email không được để trống',
        "string.email": 'Trường email không đúng định dạng',
        "any.required": 'Trường email là bắt buộc',
    }),
    phone: joi.number().required().messages({
        "string.empty": 'Trường phone không được để trống',
        "any.required": 'Trường phone là bắt buộc',
    }),
    address: joi.string().required().messages({
        "string.empty": 'Trường address không được để trống',
        "any.required": 'Trường address là bắt buộc',
    }),
    items: joi.array().items(itemSchema).required(),
    total: joi.number().required().messages({
        "string.empty": 'Trường total không được để trống',
        "any.required": 'Trường total là bắt buộc',
    }),
    User_id: joi.string().required().messages({
        "string.empty": 'Trường User_id không được để trống',
        "any.required": 'Trường User_id là bắt buộc',
    }),
}).unknown();

export default BillSchema