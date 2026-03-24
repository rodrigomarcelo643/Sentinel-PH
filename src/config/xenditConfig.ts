export const xenditConfig = {
  // Base URL (Xendit API)
  baseUrl: import.meta.env.VITE_XENDIT_BASE_URL,

  // API Keys
  publicKey: import.meta.env.VITE_XENDIT_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_XENDIT_SECRET_KEY,

  // E-Wallet / GCash related (handled via backend, but kept for consistency)
  ewalletPublicKey: import.meta.env.VITE_XENDIT_PUBLIC_KEY,
  ewalletSecretKey: import.meta.env.VITE_XENDIT_SECRET_KEY,

  // Webhook URL
  webhookUrl: import.meta.env.VITE_XENDIT_WEBHOOK_URL,
};