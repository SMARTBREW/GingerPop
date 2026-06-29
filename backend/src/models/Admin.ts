import mongoose, { Schema, models, model } from "mongoose";

export type AdminRole = "super_admin" | "admin";

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);
