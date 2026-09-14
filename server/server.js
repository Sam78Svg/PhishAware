import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import camCreationRoutes from './API/campaignCreationApi.js';
import sendCampaignRoutes from './API/sendCampaignApi.js';
import reportCreationRoutes from './API/reportCreationApi.js';
import authRoutes from './API/authApi.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes('localhost')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    const startedAt = Date.now();

    console.log('[request] started', { method: req.method, path: req.path });
    res.on('finish', () => {
        console.log('[request] completed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
});

app.get('/', (req, res) => res.send('Hello from PhishAware API ==> Deploy live 🎉'));

app.use('/api/auth', authRoutes);
app.use('/api', camCreationRoutes);
app.use('/api', reportCreationRoutes);
app.use('/api', sendCampaignRoutes);

app.post('/api/chat', requireAuth, async (req, res) => {
    const { message } = req.body;
    console.log('[chat] request authorized', {
        userId: req.auth.userId,
        type: req.auth.type,
        messageLength: typeof message === 'string' ? message.length : 0,
    });

    if (!process.env.GEMINI_API_KEY) {
        console.warn('[chat] request rejected: GEMINI_API_KEY is not configured');
        return res.status(503).json({ message: 'Gemini API key not configured' });
    }
    if (!message) {
        console.warn('[chat] request rejected: message is missing', { userId: req.auth.userId });
        return res.status(400).json({ message: 'Message required' });
    }

    try {
        console.log('[chat] sending request to Gemini', { userId: req.auth.userId });
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(message);
        console.log('[chat] Gemini response received', { userId: req.auth.userId });
        res.json({ reply: result.response.text() });
    } catch (err) {
        console.error('[chat] Gemini request failed', { userId: req.auth.userId, error: err });
        res.status(500).json({ message: 'AI error' });
    }
});

process.on('unhandledRejection', reason => console.error('Unhandled promise rejection:', reason));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.on('error', err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
