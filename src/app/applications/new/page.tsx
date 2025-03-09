'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { propertyService, applicationService, uploadService } from '@/services';
import { Property } from '@/services/property';
import { ApplicationFormData } from '@/services/application';
import { useAuthContext } from '@/hooks';

// Define form schema with Zod
const applicationSchema = z.object({
  propertyId: z.string().min(1, { message: 'Property ID is required' }),
  idCardFile: z.instanceof(File, { message: 'ID card is required' }).optional(),
  idCardUrl: z.string().optional(),
  applicationForm: z.object({
    employment: z.object({
      employer: z.string().min(1, { message: 'Employer name is required' }),
      position: z.string().min(1, { message: 'Position is required' }),
      income: z.coerce
        .number()
        .min(1, { message: 'Income must be greater than 0' }),
      yearsEmployed: z.coerce
        .number()
        .min(0, { message: 'Years employed must be a positive number' }),
    }),
    previousRental: z.object({
      hasRentedBefore: z.boolean(),
      previousLandlord: z.string().optional(),
      previousLandlordContact: z.string().optional(),
      rentalDuration: z.coerce.number().optional(),
    }),
    references: z
      .array(
        z.object({
          name: z.string().min(1, { message: 'Reference name is required' }),
          relationship: z
            .string()
            .min(1, { message: 'Relationship is required' }),
          contact: z
            .string()
            .min(1, { message: 'Contact information is required' }),
        })
      )
      .min(1, { message: 'At least one reference is required' }),
    additionalInfo: z.string().default(''),
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isTenant } = useAuthContext();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const propertyId = searchParams.get('propertyId');

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      propertyId: propertyId || '',
      idCardUrl: '',
      applicationForm: {
        employment: {
          employer: '',
          position: '',
          income: 0,
          yearsEmployed: 0,
        },
        previousRental: {
          hasRentedBefore: false,
          previousLandlord: '',
          previousLandlordContact: '',
          rentalDuration: 0,
        },
        references: [
          {
            name: '',
            relationship: '',
            contact: '',
          },
        ],
        additionalInfo: '',
      },
    },
  });

  // Fetch property details
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        toast.error('Please login to apply for a property');
        router.push('/auth/login');
        return false;
      }

      if (!isTenant) {
        toast.error('Only tenants can apply for properties');
        router.push('/');
        return false;
      }

      return true;
    };

    const fetchProperty = async () => {
      if (!propertyId || !checkAuth()) return;

      setLoading(true);
      try {
        const data = await propertyService.getPropertyById(propertyId);
        setProperty(data);

        if (!data.availability) {
          toast.error('This property is not available for rent');
          router.push('/properties');
          return;
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
        router.push('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, isAuthenticated, isTenant, router]);

  // Handle ID card upload
  const handleIdCardUpload = async (file: File) => {
    setUploadingId(true);
    try {
      const result = await uploadService.uploadIdCard(file);
      form.setValue('idCardUrl', result.fileUrl);
      toast.success('ID card uploaded successfully');
      return result.fileUrl;
    } catch (error) {
      console.error('Error uploading ID card:', error);
      toast.error('Failed to upload ID card');
      throw error;
    } finally {
      setUploadingId(false);
    }
  };

  // Add a new reference field
  const addReference = () => {
    const currentReferences = form.getValues('applicationForm.references');
    form.setValue('applicationForm.references', [
      ...currentReferences,
      { name: '', relationship: '', contact: '' },
    ]);
  };

  // Remove a reference field
  const removeReference = (index: number) => {
    const currentReferences = form.getValues('applicationForm.references');
    if (currentReferences.length > 1) {
      form.setValue(
        'applicationForm.references',
        currentReferences.filter((_, i) => i !== index)
      );
    }
  };

  // Handle form submission
  const onSubmit = async (data: ApplicationFormValues) => {
    if (!isAuthenticated || !isTenant) {
      toast.error('You must be logged in as a tenant to apply');
      return;
    }

    setSubmitting(true);
    try {
      // Upload ID card if file is provided but URL is not
      if (data.idCardFile && !data.idCardUrl) {
        data.idCardUrl = await handleIdCardUpload(data.idCardFile);
      }

      if (!data.idCardUrl) {
        toast.error('Please upload your ID card');
        setSubmitting(false);
        return;
      }

      // Prepare application data
      const applicationData: ApplicationFormData = {
        propertyId: data.propertyId,
        idCardUrl: data.idCardUrl,
        applicationForm: {
          ...data.applicationForm,
          additionalInfo: data.applicationForm.additionalInfo || '',
        },
      };

      // Submit application
      await applicationService.submitApplication(applicationData);
      toast.success('Application submitted successfully');
      router.push('/dashboard/tenant');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The property you are trying to apply for does not exist or has
              been removed.
            </p>
            <Button onClick={() => router.push('/properties')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Rental Application</h1>
        <p className="text-muted-foreground mb-8">
          Complete the form below to apply for {property.title}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>
                  Please provide accurate information to process your
                  application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* Hidden Property ID */}
                    <input type="hidden" {...form.register('propertyId')} />

                    {/* ID Card Upload */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Identification</h3>
                      <FormField
                        control={form.control}
                        name="idCardFile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload ID Card</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(file);
                                  }
                                }}
                                disabled={
                                  uploadingId || !!form.getValues('idCardUrl')
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Please upload a clear image of your
                              government-issued ID card
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.getValues('idCardUrl') && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">
                            ID card uploaded successfully
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Employment Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        Employment Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="applicationForm.employment.employer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employer</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="applicationForm.employment.position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input placeholder="Job title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="applicationForm.employment.income"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Income ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="50000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="applicationForm.employment.yearsEmployed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years Employed</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  placeholder="2.5"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Previous Rental Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        Previous Rental Information
                      </h3>
                      <FormField
                        control={form.control}
                        name="applicationForm.previousRental.hasRentedBefore"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Have you rented before?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value: string) =>
                                  field.onChange(value === 'true')
                                }
                                defaultValue={field.value ? 'true' : 'false'}
                                className="flex flex-row space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="true"
                                    id="rental-yes"
                                  />
                                  <FormLabel
                                    htmlFor="rental-yes"
                                    className="font-normal"
                                  >
                                    Yes
                                  </FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="false"
                                    id="rental-no"
                                  />
                                  <FormLabel
                                    htmlFor="rental-no"
                                    className="font-normal"
                                  >
                                    No
                                  </FormLabel>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch(
                        'applicationForm.previousRental.hasRentedBefore'
                      ) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="applicationForm.previousRental.previousLandlord"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Previous Landlord</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Landlord name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="applicationForm.previousRental.previousLandlordContact"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Landlord Contact</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Phone or email"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="applicationForm.previousRental.rentalDuration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rental Duration (years)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="1.5"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* References */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">References</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addReference}
                        >
                          Add Reference
                        </Button>
                      </div>

                      {form
                        .watch('applicationForm.references')
                        .map((_, index) => (
                          <div
                            key={index}
                            className="space-y-4 p-4 border rounded-md"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">
                                Reference {index + 1}
                              </h4>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReference(index)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`applicationForm.references.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Full name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`applicationForm.references.${index}.relationship`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Relationship</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. Employer, Friend"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`applicationForm.references.${index}.contact`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Phone or email"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        Additional Information
                      </h3>
                      <FormField
                        control={form.control}
                        name="applicationForm.additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any additional information you'd like to share"
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include any additional details that might be
                              relevant to your application
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting || uploadingId}
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                        disabled={submitting || uploadingId}
                      >
                        Cancel
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <p className="text-muted-foreground">
                    {property.address.street}, {property.address.city},{' '}
                    {property.address.state} {property.address.zipCode}
                  </p>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-muted-foreground">Annual Rent</span>
                    <span className="font-medium">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-muted-foreground">Square Feet</span>
                    <span>{property.squareFeet}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 list-decimal list-inside">
                  <li>Complete and submit the application form</li>
                  <li>Property owner reviews your application</li>
                  <li>Background check is conducted</li>
                  <li>
                    If approved, you&apos;ll be notified to proceed with payment
                  </li>
                  <li>After payment, the rental agreement will be prepared</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
