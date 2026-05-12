import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import municipiosRouter from './routes/municipios.route';
import climaRouter from './routes/clima.route';
import culturasRouter from './routes/culturas.route';
import animaisRouter from './routes/animais.route';
import agendaRouter from './routes/agenda.route';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middlewares
app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3002'] }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'AgroNexus API' });
});

// Rotas
app.use('/api/municipios', municipiosRouter);
app.use('/api/clima', climaRouter);
app.use('/api/culturas', culturasRouter);
app.use('/api/animais', animaisRouter);
app.use('/api/agenda', agendaRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🌱 AgroNexus API rodando em http://localhost:${PORT}`);
  console.log(`📡 Supabase: ${process.env.SUPABASE_URL}`);
});

export default app;
