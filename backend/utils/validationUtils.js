const Joi = require("joi");

// Schema for user registration
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
  fullName: Joi.string().min(2).max(100).optional(),
  role: Joi.string()
    .valid("user", "admin", "role_assigner", "police", "lawyer", "judge", "forensic_expert")
    .default("user"),
  agency: Joi.string().max(200).optional().allow("", null),
});

// Schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Schema for forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Schema for reset password
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

// Schema for file upload validation
const fileUploadSchema = Joi.object({
  fileType: Joi.string().required(),
  fileSize: Joi.number()
    .max(100 * 1024 * 1024)
    .required(), // Max 100MB
  caseId: Joi.string().optional().allow("", null),
  description: Joi.string().optional().allow("", null),
});

// Schema for KYC OTP generation
const kycGenerateOtpSchema = Joi.object({
  aadhaarNumber: Joi.string()
    .length(12)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "Aadhaar number must be exactly 12 digits",
      "string.pattern.base": "Aadhaar number must contain only digits",
    }),
  consent: Joi.string()
    .valid("Y", "y")
    .default("Y")
    .optional(),
  reason: Joi.string()
    .max(100)
    .default("kyc_verification")
    .optional(),
});

// Schema for KYC OTP verification
const kycVerifyOtpSchema = Joi.object({
  referenceId: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .required()
    .messages({
      "alternatives.match": "reference_id must be a number or string",
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only digits",
    }),
});

// Schema for KYC login (with Aadhaar)
const kycLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  aadhaarNumber: Joi.string()
    .length(12)
    .pattern(/^\d+$/)
    .optional(),
  skipKyc: Joi.boolean().default(false).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  fileUploadSchema,
  kycGenerateOtpSchema,
  kycVerifyOtpSchema,
  kycLoginSchema,
};
