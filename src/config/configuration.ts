export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    subscriptionPlanCode: process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    verificationTokenExpiry: parseInt(
      process.env.EMAIL_VERIFICATION_EXPIRY_HOURS || '24',
      10,
    ),
    resetTokenExpiry: parseInt(
      process.env.PASSWORD_RESET_EXPIRY_MINUTES || '30',
      10,
    ),
  },
});
