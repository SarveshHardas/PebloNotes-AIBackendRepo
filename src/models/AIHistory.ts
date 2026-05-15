import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAIHistory extends Document {
  userId: mongoose.Types.ObjectId;
  noteId: mongoose.Types.ObjectId;
  type: string;
  response: any;
  createdAt: Date;
}

const AIHistorySchema = new Schema<IAIHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      default: "tasks",
      index: true,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const AIHistory: Model<IAIHistory> =
  mongoose.models.AIHistory || mongoose.model<IAIHistory>("AIHistory", AIHistorySchema);

export default AIHistory;
