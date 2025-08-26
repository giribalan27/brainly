import { z, ZodString } from "zod";

export const SignupSchema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .min(8)
    .max(20)
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    }),
});

const contentType = ["image", "video", "article", "audio"];
export const contentSchema = z.object({
  type: z.enum(contentType),
  link: z.string(),
  title: z.string(),
  tags: z.array(z.string().min(1)).optional() 
})