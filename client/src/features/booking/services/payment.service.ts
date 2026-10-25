import { apiClient } from '@/lib/axios';

export interface InitiatePaymentInput {
  bookingId: string;
  amount?: number;
  paymentType?: 'advance' | 'full';
  cusName?: string;
  cusPhone?: string;
  cusEmail?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  data: {
    gatewayUrl: string;
    tranId: string;
    amount: number;
    currency: string;
    isSimulation?: boolean;
  };
}

export const paymentService = {
  /**
   * Initiate SSLCommerz checkout session.
   */
  async initiateSSLCommerzPayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentResponse['data']> {
    const res = await apiClient.post<InitiatePaymentResponse>(
      '/payments/sslcommerz/initiate',
      input,
    );
    return res.data.data;
  },

  /**
   * Simulate payment success in sandbox / local test mode.
   */
  async simulatePayment(input: {
    bookingCode: string;
    amount: number;
    method?: string;
    tranId?: string;
  }): Promise<{ redirectUrl: string }> {
    const res = await apiClient.post<{ success: boolean; data: { redirectUrl: string } }>(
      '/payments/sslcommerz/simulate',
      input,
    );
    return res.data.data;
  },
};
