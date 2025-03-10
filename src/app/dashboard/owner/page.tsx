'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/hooks/useAuthContext';
import propertyService, { Property } from '@/services/property';
import applicationService, { Application } from '@/services/application';
import paymentService, { Payment } from '@/services/payment';
import agreementService, { RentalAgreement } from '@/services/agreement';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OwnerDashboard() {
  const { user, isAuthenticated, isOwner } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not an owner
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (!isOwner) {
    router.push('/dashboard/tenant');
    return null;
  }

  useEffect(() => {
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
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <Button
              variant={activeTab === 'properties' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('properties')}
            >
              My Properties
            </Button>
            <Button
              variant={activeTab === 'applications' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('applications')}
            >
              Applications
            </Button>
            <Button
              variant={activeTab === 'agreements' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('agreements')}
            >
              Rental Agreements
            </Button>
            <Button
              variant={activeTab === 'payments' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Properties</h2>
                  <Link href="/properties/new">
                    <Button>Add New Property</Button>
                  </Link>
                </div>

                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't listed any properties yet.
                  </p>
                  <Link href="/properties/new">
                    <Button>List Your First Property</Button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Rental Applications
                </h2>
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <p className="text-muted-foreground">
                    No applications received yet.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'agreements' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Rental Agreements
                </h2>
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <p className="text-muted-foreground">
                    No rental agreements yet.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Payment History</h2>
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <p className="text-muted-foreground">
                    No payment history yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
