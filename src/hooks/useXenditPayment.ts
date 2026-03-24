import { useState } from 'react';
import { initiateXenditEWalletCharge, type XenditEWalletRequest } from "@/services/xenditService";

interface UseXenditPaymentReturn {
  startXenditPayment: (details: Omit<XenditEWalletRequest, 'redirectUrl'>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useXenditPayment = (): UseXenditPaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startXenditPayment = async (details: Omit<XenditEWalletRequest, 'redirectUrl'>) => {
    setLoading(true);
    setError(null);

    try {
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname;
      const returnBase = `${currentOrigin}${currentPath}`;

      // Construct redirect URLs with status params
      const redirectUrl = {
        success: `${returnBase}?status=success&amount=${details.amount}&gateway=xendit`,
        failure: `${returnBase}?status=failed&gateway=xendit`,
        cancel: `${returnBase}?status=cancel&gateway=xendit`,
      };

      const response = await initiateXenditEWalletCharge({
        ...details,
        redirectUrl,
      });

      // Check for actions to find the checkout URL
      if (response.actions) {
        const checkoutAction = response.actions.find((action: any) => action.url_type === 'WEB' || action.url_type === 'MOBILE');
        if (checkoutAction && checkoutAction.url) {
            window.location.href = checkoutAction.url;
        } else {
             throw new Error('No checkout URL found in Xendit response.');
        }
      } else {
        throw new Error('No actions received from Xendit.');
      }
    } catch (err: any) {
      console.error('Xendit Payment Error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
      throw err;
    }
  };

  return { startXenditPayment, loading, error };
};