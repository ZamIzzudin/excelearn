import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { createUserValidator, updateUserValidator } from '../validators/userValidator';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['admin']), getAllUsers);
router.get('/:id', authenticateToken, authorizeRole(['admin']), getUserById);
router.post('/', authenticateToken, authorizeRole(['admin']), createUserValidator, createUser);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateUserValidator, updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteUser);

export default router;