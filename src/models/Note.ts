import mongoose, { Document, Schema, Model } from "mongoose";

export interface INote extends Document {
  title: string;
  content?: string;
  tags: mongoose.Types.ObjectId[];
  category?: mongoose.Types.ObjectId;
  archived: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, "Note title is required."],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters."],
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ title: "text", content: "text" });

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;
