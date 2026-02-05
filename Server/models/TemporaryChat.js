import mongoose from 'mongoose';


const temporaryChatSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Socket IDs
  user1SocketId: String,
  user2SocketId: String,
  
  // Messages (lưu tạm trong 3 phút)
  messages: [{
    senderId: mongoose.Schema.Types.ObjectId,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'matched'],
    default: 'active'
  },
  
  // Timer
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Link to match
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }
}, {
  timestamps: true
});

// TTL index - tự động xóa sau khi hết hạn
temporaryChatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('TemporaryChat', temporaryChatSchema);