import mongoose, { ConnectOptions } from 'mongoose';

const database = () => {
    const mongoURI = process.env.MONGO_URI || '';
    mongoose.connect(mongoURI, {
    } as ConnectOptions).then(() => {
        console.log("Database connected");
    }
    ).catch((err) => {
        // throw new Error(err);
        console.log(err);
    });
}

export default database;