import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler, successResponse } from '../utils/helpers';
import { answerChat } from '../services/ChatbotService';

const router = Router();
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'CHAT_RATE_LIMIT', message: 'Terlalu banyak pesan. Silakan coba lagi sebentar.' } },
});

router.post('/', chatLimiter, asyncHandler(async (req, res) => {
  if (process.env.CHATBOT_ENABLED === 'false') {
    return res.status(503).json({ success: false, error: { code: 'CHATBOT_DISABLED', message: 'Chatbot sedang tidak tersedia' } });
  }
  const result = await answerChat(req.body);
  return successResponse(res, result);
}));

export default router;
