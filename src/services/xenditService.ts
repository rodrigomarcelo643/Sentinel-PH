import { xenditConfig } from '@/config/xenditConfig';
export interface XenditEWalletRequest { amount: number; referenceId: string; currency?: 'PHP'; checkoutMethod?: 'ONE_TIME_PAYMENT'; channelCode?: 'PH_GCASH' | 'PH_PAYMAYA'; redirectUrl: { success: string; failure: string; cancel: string; }; metadata?: Record<string, any>; }
export const initiateXenditEWalletCharge = async (data: XenditEWalletRequest) => {
  const auth = btoa(`${xenditConfig.secretKey?.trim()}:`);

  const payload = {
    reference_id: data.referenceId,
    currency: 'PHP',
    amount: data.amount,
    checkout_method: 'ONE_TIME_PAYMENT',

    // Xendit requires 'PH_GCASH' for Philippines GCash, not just 'GCASH'
    channel_code: data.channelCode || 'PH_GCASH',

    channel_properties: {
      success_redirect_url: data.redirectUrl.success,
      failure_redirect_url: data.redirectUrl.failure,
    },

    metadata: data.metadata || {},
  };

  const response = await fetch('https://api.xendit.co/ewallets/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      // This header is required by Xendit if a callback URL is not configured in your dashboard.
      // The API returns 404 with CALLBACK_URL_NOT_FOUND if this is missing or invalid.
      'x-callback-url': data.redirectUrl.success,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Xendit API Error Details:', result);
    throw new Error(result.message || 'Xendit request failed');
  }

  return result;
};