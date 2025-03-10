'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { propertyService } from '@/services';
import { Property } from '@/services/property';
import { useAuthContext } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isTenant } = useAuthContext();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getPropertyById(id as string);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for this property');
      router.push('/auth/login');
      return;
    }

    if (!isTenant) {
      toast.error('Only tenants can apply for properties');
      return;
    }

    router.push(`/applications/new?propertyId=${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The property you are looking for does not exist or has been removed.
          </p>
          <Link href="/properties">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={property.images[activeImageIndex]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
                {!property.availability && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg py-1.5">
                      Rented
                    </Badge>
                  </div>
                )}
              </div>
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                        activeImageIndex === index ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    {property.address.street}, {property.address.city},{' '}
                    {property.address.state} {property.address.zipCode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(property.price)}
                  </div>
                  <p className="text-muted-foreground text-sm">per year</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M3 22v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2H3Z" />
                    <circle cx="9" cy="10" r="4" />
                    <path d="M21 22v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 6a4 4 0 0 0-3 6.13" />
                  </svg>
                  <span>
                    {property.bedrooms}{' '}
                    {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M9 6v12" />
                    <path d="M5 10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V6H5v4Z" />
                    <path d="M5 22v-4" />
                    <path d="M19 22v-4" />
                  </svg>
                  <span>
                    {property.bathrooms}{' '}
                    {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V7" />
                    <path d="M8 21V7" />
                  </svg>
                  <span>{property.squareFeet} sq ft</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="3" x2="21" y1="15" y2="15" />
                    <line x1="9" x2="9" y1="3" y2="21" />
                    <line x1="15" x2="15" y1="3" y2="21" />
                  </svg>
                  <span>
                    Available {property.availability ? 'Now' : 'Soon'}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-4">
                  <p className="whitespace-pre-line">{property.description}</p>
                </TabsContent>
                <TabsContent value="amenities" className="p-4">
                  {property.amenities && property.amenities.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No amenities listed</p>
                  )}
                </TabsContent>
                <TabsContent value="location" className="p-4">
                  <p className="mb-4">
                    {property.address.street}, {property.address.city},{' '}
                    {property.address.state} {property.address.zipCode},{' '}
                    {property.address.country}
                  </p>
                  {property.address.coordinates ? (
                    <div className="bg-muted h-64 rounded-md flex items-center justify-center">
                      <p>Map would be displayed here</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Map coordinates not available
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Property Details
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Property Type
                      </span>
                      <span>Residential</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Listed On</span>
                      <span>{formatDate(property.createdAt)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>
                        {property.availability ? 'Available' : 'Rented'}
                      </span>
                    </li>
                  </ul>
                </div>

                {property.availability && (
                  <Button onClick={handleApply} className="w-full" size="lg">
                    Apply Now
                  </Button>
                )}

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">
                    Contact Information
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Interested in this property? Apply now or contact the
                    property owner for more information.
                  </p>
                  {!isAuthenticated && (
                    <div className="bg-muted p-4 rounded-md text-center">
                      <p className="mb-2">
                        Please login to see contact information
                      </p>
                      <Link href="/auth/login">
                        <Button variant="outline" size="sm">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
