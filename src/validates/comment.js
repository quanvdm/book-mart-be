import joi from "joi";
const CommentSchema = joi.object({
    content: joi.string().required().messages({
        "string.empty": 'Trường tên không được để trống',
        "any.required": 'Trường tên là bắt buộc',
    }),
}); 

export default CommentSchema