import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-3">Thanks — you're registered!</h1>
      <p className="text-gray-600 mb-8">
        We've received your details and CV. We'll review your profile and get it live shortly —
        after that, companies across Dublin will be able to find and request you for work.
      </p>
      <Link href="/" className="btn-primary">Back to Homepage</Link>
    </div>
  );
}
