import api from './api';
import { Application } from './application';
import { Property } from './property';

export interface RentalAgreement {
  _id: string;
  applicationId: string | Application;
  propertyId: string | Property;
  tenantId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  terms: string;
  tenantSignature?: {
    signedAt: string;
    ipAddress: string;
  };
  ownerSignature?: {
    signedAt: string;
    ipAddress: string;
  };
  status: 'draft' | 'tenant_signed' | 'both_signed' | 'terminated';
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgreementData {
  applicationId: string;
  startDate: string;
  endDate: string;
  terms: string;
}

const agreementService = {
  createAgreement: async (
    data: CreateAgreementData
  ): Promise<RentalAgreement> => {
    const response = await api.post<RentalAgreement>('/agreements', data);
    return response.data;
  },

  getAgreementById: async (id: string): Promise<RentalAgreement> => {
    const response = await api.get<RentalAgreement>(`/agreements/${id}`);
    return response.data;
  },

  signAgreement: async (id: string): Promise<RentalAgreement> => {
    const response = await api.put<RentalAgreement>(`/agreements/${id}/sign`);
    return response.data;
  },

  getTenantAgreements: async (): Promise<RentalAgreement[]> => {
    const response = await api.get<RentalAgreement[]>('/agreements/tenant');
    return response.data;
  },

  getOwnerAgreements: async (): Promise<RentalAgreement[]> => {
    const response = await api.get<RentalAgreement[]>('/agreements/owner');
    return response.data;
  },

  terminateAgreement: async (
    id: string,
    terminationReason: string
  ): Promise<RentalAgreement> => {
    const response = await api.put<RentalAgreement>(
      `/agreements/${id}/terminate`,
      {
        terminationReason,
      }
    );
    return response.data;
  },
};

export default agreementService;
