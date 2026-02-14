function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  appUrl: required("NEXT_PUBLIC_APP_URL"),
  appName: required("APP_NAME"),
  adminSecret: required("ADMIN_SECRET"),
  stripeSecretKey: required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: required("STRIPE_WEBHOOK_SECRET"),
  resendApiKey: required("RESEND_API_KEY"),
  emailFrom: required("EMAIL_FROM"),
  storageRegion: required("STORAGE_REGION"),
  storageBucket: required("STORAGE_BUCKET"),
  storageAccessKeyId: required("STORAGE_ACCESS_KEY_ID"),
  storageSecretAccessKey: required("STORAGE_SECRET_ACCESS_KEY"),
  storageEndpoint: required("STORAGE_ENDPOINT")
};
