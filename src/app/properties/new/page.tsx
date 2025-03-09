'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthContext } from '@/hooks/useAuthContext';
import AddressInput from '@/components/common/AddressInput';

interface PropertyFormData {
  title: string;
  description: string;
  address: {
    formattedAddress: string;
    lat: number;
    lng: number;
    streetNumber: string;
    route: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount: number;
  availabilityDate: string;
  amenities: string;
  images: FileList | null;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isOwner } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: {
      formattedAddress: '',
      lat: 0,
      lng: 0,
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    rentAmount: 0,
    availabilityDate: '',
    amenities: '',
    images: null,
  });

  useEffect(() => {
    // Redirect if not authenticated or not an owner
    if (!isAuthenticated || !isOwner) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isOwner, router]);

  const handleAddressSelect = (addressData: PropertyFormData['address']) => {
    setFormData((prev) => ({
      ...prev,
      address: addressData,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: e.target.files,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' && value) {
          Array.from(value).forEach((file) => {
            formDataToSend.append('images', file);
          });
        } else if (key === 'address') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create property');
      }

      toast.success('Property created successfully');
      router.push('/dashboard/owner');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create property'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Property Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter property title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <AddressInput
                onAddressSelect={handleAddressSelect}
                placeholder="Enter property address"
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  name="propertyType"
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: 'propertyType', value },
                    } as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityDate">Availability Date</Label>
                <Input
                  id="availabilityDate"
                  name="availabilityDate"
                  type="date"
                  value={formData.availabilityDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min={0}
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleNumberInputChange('bedrooms', e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleNumberInputChange('bathrooms', e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input
                  id="squareFeet"
                  name="squareFeet"
                  type="number"
                  min={0}
                  value={formData.squareFeet}
                  onChange={(e) =>
                    handleNumberInputChange('squareFeet', e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentAmount">Monthly Rent</Label>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  min={0}
                  value={formData.rentAmount}
                  onChange={(e) =>
                    handleNumberInputChange('rentAmount', e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter property description"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Textarea
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="Enter amenities (e.g., parking, laundry, etc.)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Property Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Property'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
