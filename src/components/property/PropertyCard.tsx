'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/services/property';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const {
    _id,
    title,
    address,
    price,
    bedrooms,
    bathrooms,
    squareFeet,
    images,
    availability,
  } = property;

  // Use the first image as the main image, or a placeholder if no images
  const mainImage =
    images && images.length > 0
      ? images[0]
      : 'https://placehold.co/600x400?text=No+Image+Available';

  return (
    <Link href={`/properties/${_id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative aspect-video">
          <Image
            src={mainImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          {!availability && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1.5">
                Rented
              </Badge>
            </div>
          )}
          <Badge className="absolute top-2 right-2">
            {formatCurrency(price)}/year
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1 mt-1">
            {address.street}, {address.city}, {address.state} {address.zipCode}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
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
                className="text-muted-foreground"
              >
                <path d="M3 22v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2H3Z" />
                <circle cx="9" cy="10" r="4" />
                <path d="M21 22v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 6a4 4 0 0 0-3 6.13" />
              </svg>
              {bedrooms}
            </span>
            <span className="flex items-center gap-1">
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
                className="text-muted-foreground"
              >
                <path d="M9 6v12" />
                <path d="M5 10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V6H5v4Z" />
                <path d="M5 22v-4" />
                <path d="M19 22v-4" />
              </svg>
              {bathrooms}
            </span>
          </div>
          <span className="flex items-center gap-1">
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
              className="text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V7" />
              <path d="M8 21V7" />
            </svg>
            {squareFeet} sq ft
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
