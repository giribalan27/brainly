import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = model("User", userSchema);

const tagSchema = new Schema({
  title: { type: String, required: true, unique: true },
});

export const Tag = model("Tag", tagSchema);

const contentType = ["image", "video", "article", "audio"];
const contentSchema = new Schema({
  type: { type: String, enum: contentType, required: true },
  link: { type: String, required: true },
  title: { type: String },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  userId: { 
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

contentSchema.pre("save", async function(next) {
    const user = await User.findById(this.userId)
    if(!user) {
        throw new Error("User does not exist")
    }
    next()
})

export const Content = model("Content", contentSchema);

const linkSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const Link = model("Link", linkSchema)