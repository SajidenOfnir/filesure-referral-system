'use client';

import React from 'react';
import { useRedirectIfAuthenticated } from '@/lib/auth';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterClient() {
  useRedirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
