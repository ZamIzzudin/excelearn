import { Router } from 'express';
import { login, getProfile } from '../controllers/authController';
import { loginValidator } from '../validators/authValidator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', loginValidator, login);
router.get('/profile', authenticateToken, getProfile);

export default router;