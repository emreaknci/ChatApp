import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './src/config/database';


import { Server } from 'socket.io';
import * as http from 'http';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));



app.get("/api/test", (req, res) => res.json("Test API"));

const PORT = process.env.PORT || 5000;
database();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const server: http.Server = http.createServer(app);





