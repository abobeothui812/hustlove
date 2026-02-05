// src/utils/catchAsync.js
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        // Chuyển lỗi sang Express Error Handler (sẽ tạo sau)
        next(err); 
    });
};

export default catchAsync;