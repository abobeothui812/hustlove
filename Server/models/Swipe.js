// models/Swipe.js
import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
    // ID của người thực hiện hành động quẹt (Người quẹt)
    swiperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Cần index để truy vấn nhanh: "A đã quẹt ai?"
    },

    // ID của người bị quẹt (Hồ sơ bị quẹt)
    swipedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Cần index để truy vấn nhanh: "Ai đã quẹt B?"
    },

    // Loại hành động: 'like' (quẹt phải) hoặc 'dislike' (quẹt trái)
    actionType: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },

    // Trường hợp này có phải là Match hay không?
    isMatch: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt/updatedAt
});

// Đảm bảo một người dùng chỉ có thể swipe một hồ sơ MỘT LẦN.
swipeSchema.index({ swiperId: 1, swipedId: 1 }, { unique: true });

export default mongoose.model('Swipe', swipeSchema);