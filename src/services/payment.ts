import api from './api';
import { Application } from './application';
import { Property } from './property';

export interface Payment {
  _id: string;
  applicationId: string | Application;
  propertyId: string | Property;
  tenantId: string;
  ownerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
  };
  receiptUrl: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentId: string;
}

const paymentService = {
  createPaymentIntent: async (
    applicationId: string
  ): Promise<PaymentIntent> => {
    const response = await api.post<PaymentIntent>('/payments/create-intent', {
      applicationId,
    });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<Payment> => {
    const response = await api.post<Payment>('/payments/confirm', {
      paymentIntentId,
    });
    return response.data;
  },

  getTenantPayments: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments/tenant');
    return response.data;
  },

  getOwnerPayments: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments/owner');
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  getPaymentReceipt: async (id: string): Promise<string> => {
    const response = await api.get<string>(`/payments/${id}/receipt`);
    return response.data;
  },
};

export default paymentService;
