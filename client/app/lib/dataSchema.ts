import { z } from "zod";

export const ErrorSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  details: z
    .array(
      z.object({
        message: z.string(),
        path: z.array(z.string()),
      }),
    )
    .optional(),
});

export const SignUpSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters long",
  }),
  email: z.email({
    message: "Please enter a valid email address",
  }),
});

export const SignInSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});

export const ChangeEmailSchema = z.object({
  newEmail: z.email({
    message: "Please enter a valid email address",
  }),
});

export const UserSchema = z.preprocess(
  (arg: any) => {
    if (typeof arg === "object" && arg !== null) {
      return {
        ...arg,
        id: arg.id || arg._id,
      };
    }
    return arg;
  },
  z.object({
    id: z.any(),
    email: z.email(),
    name: z.string(),
    role: z.string(),
    memberId: z.string(),
    emailVerified: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    isOnboarded: z.boolean().optional(),
    phone: z
      .string()
      .refine(
        (num) => num === "" || /^\+\d{10,15}$/.test(num),
        "Invalid phone number",
      )
      .optional(),
    image: z.string().optional(),
    imageId: z.string().optional(),
    occupation: z.string().optional(),
    location: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    disableBirthDate: z.boolean().optional(),
    disableEmail: z.boolean().optional(),
    disableGender: z.boolean().optional(),
  }),
);

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name must be at least 3 characters long",
    })
    .optional(),
  phone: z
    .string()
    .refine(
      (num) => num === "" || /^\+\d{10,15}$/.test(num),
      "Invalid phone number",
    )
    .optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  disableBirthDate: z.coerce.boolean().optional(),
  disableEmail: z.coerce.boolean().optional(),
  disableGender: z.coerce.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address",
  }),
});

export const ResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});

export const ChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  currentPassword: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});

export const UploadSchema = z.object({
  files: z.array(z.string()).min(1, {
    message: "At least one file is required",
  }),
  folder: z.string().min(1, {
    message: "Folder is required",
  }),
});

export const DeleteMediaSchema = z.object({
  publicIds: z.array(z.string()),
});

export const UpdateUserAvatarSchema = z.object({
  image: z.string(),
  imageId: z.string(),
});

export const createBankAccountSchema = z.object({
  bankAccountName: z.string().min(3, {
    message: "Your bank account name must be at least 3 characters long",
  }),
  bankAccountNumber: z.string().max(10, {
    message: "Your bank account number must be at most 10 characters long",
  }),
  bankCode: z.string(),
  bank: z.string(),
});

export const BankAccountSchema = z.object({
  _id: z.any(),
  userId: z.any(),
  bankAccountNumber: z.string(),
  bankAccountName: z.string(),
  bankCode: z.string(),
  bank: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const AssignRoleSchema = z.object({
  role: z.enum(["admin", "super_admin", "member"]),
});

export const CreateEventSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z
    .string()
    .min(3, {
      message: "Description must be at least 3 characters long",
    })
    .max(300, {
      message: "Description must be at most 300 characters long",
    }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters long",
  }),
  date: z.coerce.date(),
  time: z.string().min(3, {
    message: "Time must be at least 3 characters long",
  }),
  eventType: z.enum(["announcement", "meeting", "birthday", "other"]),
  organizer: z.preprocess((val) => {
    if (val === "") return undefined;
    if (typeof val === "string") return val.split(",");
    if (Array.isArray(val)) {
      return val.flatMap((p) => (typeof p === "string" ? p.split(",") : p));
    }
    return val;
  }, z.array(z.any())),
  isPublic: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.union([z.boolean(), z.string()]),
    )
    .default(true),
  featuredImage: z.string().optional().describe("Base64 encoded image string"),
  featuredImageId: z.string().optional(),
  fees: z.coerce.number().default(0),
});

export const EventSchema = z.object({
  _id: z.any(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.coerce.date(),
  time: z.string(),
  eventType: z
    .enum(["announcement", "meeting", "birthday", "other"])
    .refine((value: string) => value !== "", {
      message: "Event type is required",
    }),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
  interestedMembers: z.preprocess(
    (val) => (val === "" ? [] : Array.isArray(val) ? val : [val]),
    z.array(z.any()),
  ),
  organizer: z.preprocess(
    (val) => (val === "" ? [] : Array.isArray(val) ? val : [val]),
    z.array(z.any()),
  ),
  isPublic: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.union([z.boolean(), z.string()]),
  ),
  featuredImage: z.string().optional(),
  featuredImageId: z.string().optional(),
  fees: z.coerce.number(),
});

export const UpdateEventSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .optional(),
  description: z
    .string()
    .min(3, {
      message: "Description must be at least 3 characters long",
    })
    .max(300, {
      message: "Description must be at most 300 characters long",
    })
    .optional(),
  location: z
    .string()
    .min(3, {
      message: "Location must be at least 3 characters long",
    })
    .optional(),
  date: z.coerce.date().optional(),
  time: z
    .string()
    .min(3, {
      message: "Time must be at least 3 characters long",
    })
    .optional(),
  eventType: z
    .enum(["announcement", "meeting", "birthday", "other"])
    .optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
  interestedMembers: z.preprocess(
    (val) => (val === "" ? [] : Array.isArray(val) ? val : [val]),
    z.array(z.any()),
  ),
  organizer: z
    .preprocess(
      (val) => (val === "" ? [] : Array.isArray(val) ? val : [val]),
      z.array(z.any()),
    )
    .optional(),
  isPublic: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.union([z.boolean(), z.string()]),
    )
    .optional(),
  featuredImage: z.string().optional(),
  featuredImageId: z.string().optional(),
  fees: z.coerce.number().optional(),
});

export const BatchDeleteEventSchema = z.object({
  ids: z.array(z.string()).min(1, "Event is required"),
});

export const CreateTicketSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z
    .string()
    .min(3, {
      message: "Description must be at least 3 characters long",
    })
    .max(200, {
      message: "Description must be at most 200 characters long",
    }),
  category: z.enum(["technical", "event", "payment", "other"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

export const TicketSchema = z.object({
  _id: z.any(),
  userId: z.any(),
  ticketId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["technical", "event", "payment", "other"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in-progress", "resolved", "closed"]),
  assignedTo: z.any().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const UpdateTicketSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .optional(),
  description: z
    .string()
    .min(3, {
      message: "Description must be at least 3 characters long",
    })
    .max(200, {
      message: "Description must be at most 200 characters long",
    })
    .optional(),
  category: z.enum(["technical", "event", "payment", "other"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
  assignedTo: z.any().optional(),
});

export const initializePaymentSchema = z.object({
  amount: z.coerce.number().min(2000, "Minimum payment amount is 2000 Naira"),
  paymentType: z.enum(["donation", "event", "membership_dues"]),
  isRecurring: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.union([z.boolean(), z.string()]),
    )
    .optional(),
  eventId: z.string().optional(),
  note: z
    .string()
    .min(5, "Note should be at least 5 characters long")
    .max(50, "Note should be at most 50 characters long")
    .optional(),
});

export const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export const cancelSubscriptionSchema = z.object({
  code: z.string().optional().default(""),
  token: z.string().optional().default(""),
  reference: z.string().optional(),
});

export const paymentSchema = z.object({
  _id: z.any(),
  userId: z.any(),
  paymentType: z.string(),
  amount: z.number(),
  paymentStatus: z.string(),
  reference: z.string(),
  isRecurring: z.boolean(),
  paystackSubscriptionId: z.string().optional(),
  paystackEmailToken: z.string().optional(),
  lastPaymentDate: z.union([z.string(), z.date()]).optional().nullable(),
  nextPaymentDate: z.union([z.string(), z.date()]).optional().nullable(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  metadata: z.any().optional(),
  eventId: z.string().optional(),
  note: z.string().optional(),
});

export type UserData = z.infer<typeof UserSchema>;
export type SignupFormData = z.infer<typeof SignUpSchema>;
export type SigninFormData = z.infer<typeof SignInSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type ChangeEmailData = z.infer<typeof ChangeEmailSchema>;
export type UploadFormData = z.infer<typeof UploadSchema>;
export type DeleteMediaData = z.infer<typeof DeleteMediaSchema>;
export type UpdateUserAvatarData = z.infer<typeof UpdateUserAvatarSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type CreateBankAccountData = z.infer<typeof createBankAccountSchema>;
export type BankAccountData = z.infer<typeof BankAccountSchema>;
export type AssignRoleData = z.infer<typeof AssignRoleSchema>;
export type CreateEventData = z.infer<typeof CreateEventSchema>;
export type EventData = z.infer<typeof EventSchema>;
export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
export type BatchDeleteEventData = z.infer<typeof BatchDeleteEventSchema>;
export type CreateTicketData = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketData = z.infer<typeof UpdateTicketSchema>;
export type TicketData = z.infer<typeof TicketSchema>;
export type InitializePaymentData = z.infer<typeof initializePaymentSchema>;
export type VerifyPaymentData = z.infer<typeof verifyPaymentSchema>;
export type CancelSubscriptionData = z.infer<typeof cancelSubscriptionSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
