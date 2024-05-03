import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  type: ChatType;
  messages: mongoose.Types.ObjectId[];
  timestamp: Date;
  creator: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  name?: string;
}

export enum ChatType {
  'Private',
  'Group',
  'Broadcast'
}

const chatSchema: Schema = new Schema({
  type: {
    type: Number,
    enum: ChatType,
    required: true
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  name: {
    type: String,
    required: false
  }
});

export default mongoose.model<IChat>('Chat', chatSchema);
