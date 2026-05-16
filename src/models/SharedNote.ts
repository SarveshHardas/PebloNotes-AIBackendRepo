import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISharedNote extends Document {
  noteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  shareId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SharedNoteSchema = new Schema<ISharedNote>(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SharedNote: Model<ISharedNote> =
  mongoose.models.SharedNote ||
  mongoose.model<ISharedNote>("SharedNote", SharedNoteSchema);

export default SharedNote;
