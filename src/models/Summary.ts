import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISummary extends Document {
  noteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Summary: Model<ISummary> =
  mongoose.models.Summary || mongoose.model<ISummary>("Summary", SummarySchema);

export default Summary;
