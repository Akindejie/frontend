'use client';

import Link from 'next/link';
import { useAuthContext } from '@/hooks/useAuthContext';

export default function Navbar() {
  const { isAuthenticated, isOwner, isTenant, logout } = useAuthContext();

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Bolibro Rental
          </Link>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium hover:text-primary"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {isOwner && (
                  <Link
                    href="/dashboard/owner"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {isTenant && (
                  <Link
                    href="/dashboard/tenant"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Tenant Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium hover:text-primary"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
