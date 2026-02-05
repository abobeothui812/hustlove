// models/Token.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },

    // Refresh Token đã được hash (băm)
    token: {
        type: String,
        required: true,
    },
    
    // Ngày hết hạn của Refresh Token
    expires: {
        type: Date,
        required: true
    },

    // Cung cấp thông tin về thiết bị/phiên làm việc
    deviceName: {
        type: String,
        default: 'Unknown Device'
    },
    
    // Trạng thái (đã thu hồi hay chưa)
    blacklisted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Tự động xóa token sau khi nó hết hạn (expires)
tokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Token', tokenSchema);