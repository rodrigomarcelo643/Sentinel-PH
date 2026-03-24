import { mayaConfig } from '@/config/mayaConfig';

export interface BuyerDetails {
  firstName: string;
  lastName: string;
  contact: {
    email: string;
    phone: string;
  };
}

export interface MayaPaymentRequest {
  amount: number;
  description: string;
  requestReferenceNumber: string;
  buyer: BuyerDetails;
  redirectUrl: {
    success: string;
    failure: string;
    cancel: string;
  };
}

/**
 * Initiates a checkout session with Maya Sandbox.
 * NOTE: This uses the Sandbox API. No real money is deducted.
 * Use test card credentials provided by Maya for simulation.
 */
export const initiateMayaCheckout = async (data: MayaPaymentRequest) => {
  // Use Public Key for client-side API calls to avoid 401/CORS issues with Secret Key.
  const auth = btoa(`${mayaConfig.publicKey.trim()}:`);

  const response = await fetch(`${mayaConfig.baseUrl}/checkout/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      totalAmount: {
        value: data.amount,
        currency: 'PHP',
      },
      buyer: data.buyer,
      items: [
        {
          name: data.description,
          quantity: 1,
          code: 'REG_ITEM',
          amount: {
            value: data.amount,
          },
          totalAmount: {
            value: data.amount,
          },
        },
      ],
      requestReferenceNumber: data.requestReferenceNumber,
      redirectUrl: data.redirectUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Maya API Error Details:', errorData);
    throw new Error(errorData.message || `Failed to initiate Maya payment: ${response.status}`);
  }

  return response.json();
};

/**
 * Initiates a "Pay with Maya" (Single Payment) session for E-Wallet/QR.
 * Uses the PayWith keys.
 */
export const initiateMayaWalletPayment = async (data: MayaPaymentRequest) => {
  const auth = btoa(`${mayaConfig.payWithPublicKey.trim()}:`);

  const response = await fetch(`${mayaConfig.baseUrl}/payby/v2/paymaya/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      totalAmount: {
        value: data.amount,
        currency: 'PHP',
      },
      requestReferenceNumber: data.requestReferenceNumber,
      userId: data.buyer.contact.email, // Pre-fills the user's account
      redirectUrl: data.redirectUrl,
      metadata: {
        pf: {
          smi: 'SM001',
          smn: 'SentinelPh Merchant',
          mci: '0000',
          mpc: '608',
          mco: 'PHL',
        },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Maya Wallet API Error:", JSON.stringify(result, null, 2));
    const details = result.parameters ? ` Details: ${JSON.stringify(result.parameters)}` : "";
    throw new Error(`${result.message || "Maya request failed"}${details}`);
  }

  return result;
};