import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', authenticateToken, getProfile);

export default router;