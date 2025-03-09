import api from './api';

const uploadService = {
  uploadIdCard: async (file: File): Promise<{ fileUrl: string }> => {
    const formData = new FormData();
    formData.append('idCard', file);

    const response = await api.post<{ fileUrl: string }>(
      '/upload/id-card',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  getUploadedFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/upload/${fileId}`, {
      responseType: 'blob',
    });

    return response.data;
  },
};

export default uploadService;
