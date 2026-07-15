import mongoose, { Schema, models, model } from "mongoose";

export interface IStudent {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Student = models.Student || model<IStudent>("Student", StudentSchema);
