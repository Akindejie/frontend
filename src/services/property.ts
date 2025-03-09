import api from './api';

export interface Property {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  amenities: string[];
  images: string[];
  availability: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface PropertyResponse {
  properties: Property[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreatePropertyData {
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  amenities: string[];
  images: string[];
}

const propertyService = {
  getProperties: async (
    filters: PropertyFilters = {}
  ): Promise<PropertyResponse> => {
    const response = await api.get<PropertyResponse>('/properties', {
      params: filters,
    });
    return response.data;
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (data: CreatePropertyData): Promise<Property> => {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },

  updateProperty: async (
    id: string,
    data: Partial<CreatePropertyData>
  ): Promise<Property> => {
    const response = await api.put<Property>(`/properties/${id}`, data);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/properties/${id}`);
    return response.data;
  },

  getOwnerProperties: async (): Promise<Property[]> => {
    const response = await api.get<Property[]>('/properties/owner');
    return response.data;
  },

  uploadPropertyImages: async (
    id: string,
    images: File[]
  ): Promise<{ images: string[] }> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post<{ images: string[] }>(
      `/properties/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};

export default propertyService;
