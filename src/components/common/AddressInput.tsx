import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

interface AddressInputProps {
  onAddressSelect: (address: {
    formattedAddress: string;
    lat: number;
    lng: number;
    streetNumber: string;
    route: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
  isRequired?: boolean;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const AddressInput = ({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Enter an address',
  isRequired = false,
}: AddressInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=us&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions');
      }

      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the search function
  const debouncedSearch = debounce(searchAddress, 300);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedSearch.cancel();
    };
  }, []);

  const handleSelect = (result: NominatimResult) => {
    setValue(result.display_name);
    setSuggestions([]);

    const addressData = {
      formattedAddress: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      streetNumber: result.address.house_number || '',
      route: result.address.road || '',
      city: result.address.city || '',
      state: result.address.state || '',
      postalCode: result.address.postcode || '',
      country: result.address.country || '',
    };

    onAddressSelect(addressData);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          required={isRequired}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4" />
          </div>
        )}
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 max-h-[200px] overflow-y-auto bg-background rounded-md border shadow-lg z-50">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(suggestion)}
            >
              <p className="text-sm">{suggestion.display_name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;
