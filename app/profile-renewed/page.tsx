import Link from 'next/link';

export default function ProfileRenewedPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-3">Your profile is active again</h1>
      <p className="text-gray-600 mb-8">
        Thanks for confirming — your listing will stay live for another 24 months from today.
      </p>
      <Link href="/" className="btn-primary">Back to Homepage</Link>
    </div>
  );
}

