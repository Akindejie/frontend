'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/hooks';
import { applicationService } from '@/services';
import { Application } from '@/services/application';
import { formatDate } from '@/lib/utils';

export default function TenantDashboardPage() {
  const { user, isAuthenticated, isTenant } = useAuthContext();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated or not a tenant
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isTenant) {
      router.push('/dashboard/owner');
      return;
    }

    // Fetch tenant applications
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await applicationService.getTenantApplications();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, isTenant, router]);

  const getStatusBadgeClass = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'background_check':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
          <Button onClick={() => router.push('/properties')}>
            Browse Properties
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Applications</CardTitle>
              <CardDescription>Your rental applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Rentals</CardTitle>
              <CardDescription>
                Properties you're currently renting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.filter((app) => app.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="rentals">Active Rentals</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Applications</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-muted p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">
                  No applications yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't applied for any properties yet. Browse available
                  properties to get started.
                </p>
                <Button onClick={() => router.push('/properties')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application._id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {typeof application.propertyId === 'object'
                                ? application.propertyId.title
                                : 'Property'}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Applied on {formatDate(application.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              application.status
                            )}`}
                          >
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/applications/${application._id}`)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Active Rentals</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : applications.filter((app) => app.status === 'approved')
                .length === 0 ? (
              <div className="bg-muted p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">No active rentals</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active rental agreements yet.
                </p>
                <Button onClick={() => router.push('/properties')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter((app) => app.status === 'approved')
                  .map((application) => (
                    <Card key={application._id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {typeof application.propertyId === 'object'
                                  ? application.propertyId.title
                                  : 'Property'}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Approved on {formatDate(application.updatedAt)}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>

                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/applications/${application._id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
