import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors, { CorsOptions } from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

const port = Number(process.env.PORT) || 3000;

const normalizeOrigin = (origin: string) =>
    origin.trim().replace(/^['\"]|['\"]$/g, '').replace(/\/$/, '');

const envTrustedOrigins = process.env.TRUSTED_ORIGINS
    ?.split(',')
    .map(normalizeOrigin)
    .filter(Boolean) || [];

const defaultTrustedOrigins = [
    'http://localhost:5173',
    'https://site-builder-static.onrender.com',
];

const trustedOrigins = Array.from(new Set([
    ...defaultTrustedOrigins,
    ...envTrustedOrigins
])).filter(Boolean);

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (trustedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))
app.options('/{*any}', cors(corsOptions));
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhook)

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({limit: '50mb'}))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});