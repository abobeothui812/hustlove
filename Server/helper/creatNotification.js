export async function createNotification({
  recipientId,
  senderId,
  type,
  postId,
  commentId,
  conversationId,
  content
}) {
  // Không tạo notification cho chính mình
  if (recipientId.toString() === senderId.toString()) {
    return null;
  }

  // Kiểm tra duplicate (không tạo notification trùng trong vòng 1 phút)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const existingNotif = await Notification.findOne({
    recipientId,
    senderId,
    type,
    postId,
    createdAt: { $gte: oneMinuteAgo }
  });

  if (existingNotif) {
    return existingNotif;
  }

  // Tạo notification mới
  const notification = await Notification.create({
    recipientId,
    senderId,
    type,
    postId,
    commentId,
    conversationId,
    content
  });

  return notification;
}