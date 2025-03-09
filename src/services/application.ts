import api from './api';
import { Property } from './property';

export interface Application {
  _id: string;
  propertyId: string | Property;
  tenantId: string;
  status:
    | 'pending'
    | 'in_review'
    | 'background_check'
    | 'approved'
    | 'rejected';
  idCardUrl: string;
  applicationForm: {
    employment: {
      employer: string;
      position: string;
      income: number;
      yearsEmployed: number;
    };
    previousRental: {
      hasRentedBefore: boolean;
      previousLandlord?: string;
      previousLandlordContact?: string;
      rentalDuration?: number;
    };
    references: {
      name: string;
      relationship: string;
      contact: string;
    }[];
    additionalInfo: string;
  };
  backgroundCheckStatus: 'not_started' | 'in_progress' | 'completed';
  backgroundCheckResults?: {
    passed: boolean;
    notes: string;
    completedAt: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFormData {
  propertyId: string;
  idCardUrl: string;
  applicationForm: {
    employment: {
      employer: string;
      position: string;
      income: number;
      yearsEmployed: number;
    };
    previousRental: {
      hasRentedBefore: boolean;
      previousLandlord?: string;
      previousLandlordContact?: string;
      rentalDuration?: number;
    };
    references: {
      name: string;
      relationship: string;
      contact: string;
    }[];
    additionalInfo: string;
  };
}

export interface BackgroundCheckData {
  passed: boolean;
  notes: string;
}

const applicationService = {
  submitApplication: async (
    data: ApplicationFormData
  ): Promise<Application> => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },

  getTenantApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/tenant');
    return response.data;
  },

  getOwnerApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications/owner');
    return response.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (
    id: string,
    status: Application['status'],
    rejectionReason?: string
  ): Promise<Application> => {
    const response = await api.put<Application>(`/applications/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  startBackgroundCheck: async (id: string): Promise<Application> => {
    const response = await api.post<Application>(
      `/applications/${id}/background-check`
    );
    return response.data;
  },

  updateBackgroundCheckResults: async (
    id: string,
    data: BackgroundCheckData
  ): Promise<Application> => {
    const response = await api.put<Application>(
      `/applications/${id}/background-check`,
      data
    );
    return response.data;
  },
};

export default applicationService;
