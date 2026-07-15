import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Register as a Temp',
  description:
    'Register with Find A Temp — upload your CV, set your location, hourly rate, and availability, and get matched with companies across Dublin.',
};

export default async function RegisterPage() {
  const [areas, categories] = await Promise.all([
    prisma.area.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Register as a Temp</h1>
      <p className="text-gray-600 mb-8">
        Fill in your details below. Once approved, companies across Dublin will be able to
        find your profile — your full CV and contact details are never shown publicly; we only
        share them with your permission.
      </p>
      <RegisterForm areas={areas} categories={categories} />
    </div>
  );
}
