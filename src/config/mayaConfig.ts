export const mayaConfig = {
  // Sandbox Environment Base URL
  baseUrl: import.meta.env.VITE_MAYA_BASE_URL,

  // Sandbox Merchant Keys (Party 2)
  publicKey: import.meta.env.VITE_MAYA_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_MAYA_SECRET_KEY,

  // Pay with Maya (QR / Wallet) Keys
  payWithPublicKey: import.meta.env.VITE_MAYA_PAYWITH_PUBLIC_KEY,
  payWithSecretKey: import.meta.env.VITE_MAYA_PAYWITH_SECRET_KEY,

  // Webhook URL
  webhookUrl: import.meta.env.VITE_MAYA_WEBHOOK_URL,
};