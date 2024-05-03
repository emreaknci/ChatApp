import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './src/config/database';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import chatRoutes from './src/routes/chatRoutes';
import messageRoutes from './src/routes/messageRoutes';

import { Server } from 'socket.io';
import * as http from 'http';
import { handleSocketConnection } from './src/handlers/socketHandlers';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);


app.get("/api/test", (req, res) => res.json("Test API"));

const PORT = process.env.PORT || 5000;
database();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const server: http.Server = http.createServer(app);
const io: Server = new Server(server
    , {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    }
);
const SOCKET = process.env.SOCKET || 5001;

io.listen(Number(SOCKET));
io.on('connection', (socket) => {

    handleSocketConnection(socket, io);
});