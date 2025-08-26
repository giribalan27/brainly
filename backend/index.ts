import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import "dotenv/config";
import { Content, Link, Tag, User } from "./schema";
import { contentSchema, SignupSchema } from "./types";
import { authMiddleware } from "./middleware";
const app = express();
app.use(express.json());

app.post("/api/v1/sign-up", async (req, res) => {
  try {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(411).json({
        success: false,
        msg: "Invalid data",
      });
      return;
    }
    const { username, password } = parsedData.data!;
    const existingUser = await User.findOne({
      username: username,
    });
    if (existingUser) {
      res.status(400).json({
        status: false,
        msg: "User already exists",
      });
    }

    const saltRounds = 5;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json({
      success: true,
      msg: "Signed Up successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

app.post("/api/v1/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });

    if (!user || !user.password) {
      res.status(403).json({
        success: false,
        msg: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(403).json({
        success: false,
        msg: "Invalid credentials",
      });
      return;
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET!
    );

    res.status(200).json({
      success: true,
      token: token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

app.get("/api/v1/content", authMiddleware, async (req, res) => {
  try {
    const content = await Content.find({userId: req.userId}).populate('tags');
    res.status(200).json({
      success: true,
      content
    })    
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "server error",
    });
  }
});

app.post("/api/v1/content", authMiddleware, async (req, res) => {
  try {
    const parsedData = contentSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        error: "invalid data",
      });
    }
    
    const content = parsedData.data;
    const tagId = []
    if(content.tags) {
      for(const tag of content.tags) {
        const existingTag = await Tag.findOne({title: tag})
        if(existingTag) {
          tagId.push(existingTag._id);
        }
        else {
          const newTag = new Tag({title: tag});
          await newTag.save();
          tagId.push(newTag._id);
        }
      }
    }
    const newContent = new Content({
      ...content,
      tags: tagId,
      userId: req.userId,
    });
    await newContent.save();
    res.status(201).json({
      success: true,
      msg: "Content created successfully",
      contentId: newContent._id,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "server error",
    });
  }
});

app.delete("/api/v1/content", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    if(!id) {
      return res.status(400).json({
        success: false,
        msg: "content ID is required",
      });
    }
    const deleteContent = await Content.findByIdAndDelete(id);
    if (!deleteContent) {
      return res.json({
        success: false,
        msg: "content not found",
      });
    }
    res.status(200).json({
      success: true,
      msg: "Deleted successfully",
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "server error",
    });
  }
});

app.post("/api/v1/brain/share", authMiddleware, async (req, res) => {
  try {
    const userId  = req.userId;
    if(!userId) {
      return res.status(400).json({
        success: false,
        msg: "userId is required",
      });
    }
    const link = new Link({
      userId,
    }) 
    await link.save();
    res.status(201).json({
      success: true,
      linkId: link._id,
    })
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      msg: "server error",
    });
  }
});

app.get("/api/v1/brain/:sharelink", async (req, res) => {
  const shareLink = req.params.sharelink;
   try {
    const linkDoc = await Link.findById(shareLink);
    if(!linkDoc) {
      return res.status(404).json({
        success: false,
        msg: "link not found"
      })
    }
    const content = await Content.find({userId: linkDoc.userId}).populate('tags');
    res.status(200).json({
      success: true,
      content
    })    
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "server error",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Invalid route. Please check the API endpoint.",
  });
});

app.listen(3000, () => {
  mongoose
    .connect(process.env.DB_URL!)
    .then(() => {
      console.log("connected successfully");
    })
    .catch(() => {
      console.log("Error");
    });
  console.log("server is running on port 3000");
});
