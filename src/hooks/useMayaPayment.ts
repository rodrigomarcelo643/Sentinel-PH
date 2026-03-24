import { useState } from 'react';
import { initiateMayaCheckout, type MayaPaymentRequest } from "@/services/mayaService";

interface UseMayaPaymentReturn {
  startPayment: (details: Omit<MayaPaymentRequest, 'redirectUrl'>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useMayaPayment = (): UseMayaPaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async (details: Omit<MayaPaymentRequest, 'redirectUrl'>) => {
    setLoading(true);
    setError(null);

    try {
      // Construct Redirect URLs based on current location
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname; // Should be the register page
      const returnBase = `${currentOrigin}${currentPath}`;

      // We append status and amount query params to handle the return state
      const redirectUrl = {
        success: `${returnBase}?status=success&amount=${details.amount}`,
        failure: `${returnBase}?status=failed`,
        cancel: `${returnBase}?status=cancel`,
      };

      const response = await initiateMayaCheckout({
        ...details,
        redirectUrl,
      });

      if (response.redirectUrl) {
        // Redirect user to Maya Sandbox
        window.location.href = response.redirectUrl;
      } else {
        throw new Error('No redirect URL received from Maya.');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false); // Only stop loading on error, otherwise we are redirecting
      throw err;
    }
  };

  return { startPayment, loading, error };
};