import mongoose, { Document, Schema, model } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  encryptedContent: string;
  iv: Buffer;
  key: Buffer;
  timestamp: Date;
}

const messageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: Buffer,
    required: true
  },
  key: {
    type: Buffer,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default model<IMessage>('Message', messageSchema);
