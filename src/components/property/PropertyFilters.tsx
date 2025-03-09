'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyFilters as PropertyFiltersType } from '@/services/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

// Common amenities for filtering
const AMENITIES = [
  'Air Conditioning',
  'Balcony',
  'Dishwasher',
  'Elevator',
  'Furnished',
  'Garage',
  'Garden',
  'Gym',
  'Heating',
  'Internet',
  'Laundry',
  'Parking',
  'Pets Allowed',
  'Pool',
  'Security System',
  'Wheelchair Access',
];

interface PropertyFiltersProps {
  initialFilters?: PropertyFiltersType;
  onFilterChange?: (filters: PropertyFiltersType) => void;
}

export function PropertyFilters({
  initialFilters,
  onFilterChange,
}: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state with URL params or initial filters
  const [filters, setFilters] = useState<PropertyFiltersType>({
    city: searchParams.get('city') || initialFilters?.city || '',
    state: searchParams.get('state') || initialFilters?.state || '',
    minPrice:
      Number(searchParams.get('minPrice')) || initialFilters?.minPrice || 0,
    maxPrice:
      Number(searchParams.get('maxPrice')) || initialFilters?.maxPrice || 10000,
    bedrooms:
      Number(searchParams.get('bedrooms')) || initialFilters?.bedrooms || 0,
    bathrooms:
      Number(searchParams.get('bathrooms')) || initialFilters?.bathrooms || 0,
    amenities:
      searchParams.get('amenities')?.split(',') ||
      initialFilters?.amenities ||
      [],
  });

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];

    handleFilterChange('amenities', updatedAmenities);
  };

  // Apply filters to URL and trigger search
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.city) params.set('city', filters.city);
    if (filters.state) params.set('state', filters.state);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms)
      params.set('bathrooms', filters.bathrooms.toString());
    if (filters.amenities && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','));
    }

    router.push(`/properties?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    const emptyFilters: PropertyFiltersType = {
      city: '',
      state: '',
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
    };

    setFilters(emptyFilters);

    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }

    router.push('/properties');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Price Range (Annual)</h3>
            <div className="space-y-6">
              <div className="flex justify-between">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
              <Slider
                defaultValue={[
                  filters.minPrice || 0,
                  filters.maxPrice || 10000,
                ]}
                min={0}
                max={10000}
                step={100}
                onValueChange={(value) => {
                  handleFilterChange('minPrice', value[0]);
                  handleFilterChange('maxPrice', value[1]);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                value={filters.bedrooms?.toString() || '0'}
                onValueChange={(value) =>
                  handleFilterChange('bedrooms', Number(value))
                }
              >
                <SelectTrigger id="bedrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                value={filters.bathrooms?.toString() || '0'}
                onValueChange={(value) =>
                  handleFilterChange('bathrooms', Number(value))
                }
              >
                <SelectTrigger id="bathrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="amenities">
              <AccordionTrigger>Amenities</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={(filters.amenities || []).includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-normal"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
