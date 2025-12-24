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
});
