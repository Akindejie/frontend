'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/hooks';
import propertyService, { Property } from '@/services/property';
import applicationService, { Application } from '@/services/application';
import paymentService, { Payment } from '@/services/payment';
import agreementService, { RentalAgreement } from '@/services/agreement';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isOwner } = useAuthContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is an owner
    if (!isAuthenticated) {
      toast.error('Please login to access your dashboard');
      router.push('/auth/login');
      return;
    }

    if (!isOwner) {
      toast.error('Only property owners can access this dashboard');
      router.push('/');
      return;
    }

    // Fetch owner data
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propertiesData, applicationsData, paymentsData, agreementsData] =
          await Promise.all([
            propertyService.getOwnerProperties(),
            applicationService.getOwnerApplications(),
            paymentService.getOwnerPayments(),
            agreementService.getOwnerAgreements(),
          ]);

        setProperties(propertiesData);
        setApplications(applicationsData);
        setPayments(paymentsData);
        setAgreements(agreementsData);
      } catch (error) {
        console.error('Error fetching owner data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isOwner, router]);

  // Calculate statistics
  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter((p) => p.availability).length,
    pendingApplications: applications.filter((a) => a.status === 'pending')
      .length,
    activeAgreements: agreements.filter((a) => a.status === 'active').length,
    monthlyRevenue: payments
      .filter((p) => {
        const paymentDate = new Date(p.createdAt);
        const currentDate = new Date();
        return (
          paymentDate.getMonth() === currentDate.getMonth() &&
          paymentDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((total, payment) => total + payment.amount, 0),
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableProperties} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-muted-foreground">
                Require your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAgreements}</div>
              <p className="text-xs text-muted-foreground">Current tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/properties/new')}
                className="w-full"
                size="sm"
              >
                Add Property
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">My Properties</h2>
                <Button onClick={() => router.push('/properties/new')}>
                  Add Property
                </Button>
              </div>

              {properties.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t listed any properties yet.
                    </p>
                    <Button onClick={() => router.push('/properties/new')}>
                      Add Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Card key={property._id}>
                      <CardHeader>
                        <CardTitle className="truncate">
                          {property.title}
                        </CardTitle>
                        <CardDescription>
                          {property.address.city}, {property.address.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-medium">
                              {formatCurrency(property.price)}/year
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium">
                              {property.availability ? 'Available' : 'Rented'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Listed On
                            </span>
                            <span className="font-medium">
                              {formatDate(property.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/properties/${property._id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/properties/${property._id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Rental Applications</h2>

              {applications.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You don&apos;t have any applications yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {applications.map((application) => (
                    <Card key={application._id}>
                      <CardHeader>
                        <CardTitle>
                          {typeof application.propertyId === 'string'
                            ? 'Property Application'
                            : application.propertyId.title}
                        </CardTitle>
                        <CardDescription>
                          Received on {formatDate(application.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium capitalize">
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Applicant
                            </span>
                            <span className="font-medium">
                              {typeof application.tenantId === 'string'
                                ? 'Tenant'
                                : `${application.tenantId.firstName} ${application.tenantId.lastName}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Background Check
                            </span>
                            <span className="font-medium capitalize">
                              {application.backgroundCheckStatus.replace(
                                '_',
                                ' '
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            router.push(
                              `/applications/${application._id}/review`
                            )
                          }
                        >
                          Review Application
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Payment History</h2>

              {payments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You haven&apos;t received any payments yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {payments.map((payment) => (
                    <Card key={payment._id}>
                      <CardHeader>
                        <CardTitle>
                          {typeof payment.propertyId === 'string'
                            ? 'Property Payment'
                            : payment.propertyId.title}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(payment.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount
                            </span>
                            <span className="font-medium">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium capitalize">
                              {payment.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Tenant
                            </span>
                            <span className="font-medium">
                              {typeof payment.tenantId === 'string'
                                ? 'Tenant'
                                : `${payment.tenantId.firstName} ${payment.tenantId.lastName}`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            router.push(`/payments/${payment._id}`)
                          }
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Agreements Tab */}
          <TabsContent value="agreements">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Rental Agreements</h2>

              {agreements.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      You don&apos;t have any rental agreements yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agreements.map((agreement) => (
                    <Card key={agreement._id}>
                      <CardHeader>
                        <CardTitle>
                          {typeof agreement.propertyId === 'string'
                            ? 'Rental Agreement'
                            : agreement.propertyId.title}
                        </CardTitle>
                        <CardDescription>
                          Created on {formatDate(agreement.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium capitalize">
                              {agreement.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Tenant
                            </span>
                            <span className="font-medium">
                              {typeof agreement.tenantId === 'string'
                                ? 'Tenant'
                                : `${agreement.tenantId.firstName} ${agreement.tenantId.lastName}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Period
                            </span>
                            <span className="font-medium">
                              {formatDate(agreement.startDate)} -{' '}
                              {formatDate(agreement.endDate)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/agreements/${agreement._id}`)
                          }
                        >
                          View
                        </Button>
                        {agreement.status !== 'both_signed' &&
                          agreement.status !== 'terminated' && (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() =>
                                router.push(`/agreements/${agreement._id}/sign`)
                              }
                            >
                              Sign
                            </Button>
                          )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
