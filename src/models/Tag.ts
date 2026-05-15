import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITag extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required."],
      trim: true,
      lowercase: true,
      maxlength: [20, "Tag name cannot exceed 20 characters."],
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

TagSchema.index({ name: 1, userId: 1 }, { unique: true });

const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);

export default Tag;
