import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { updateUserValidator } from '../validators/userValidator';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['admin']), getAllUsers);
router.get('/:id', authenticateToken, authorizeRole(['admin']), getUserById);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateUserValidator, updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteUser);

export default router;