import { Router } from 'express';
import { getNoticiasPersonalizadas } from '../controllers/noticias.controller';

const router = Router();

// Rota POST para receber o perfil do usuário e retornar notícias personalizadas
router.post('/', getNoticiasPersonalizadas);

export default router;
