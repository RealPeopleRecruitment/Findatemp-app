import { permanentRedirect, notFound } from 'next/navigation';
import { resolveLegacyUrl } from '@/lib/legacy-redirects';

export default async function LegacyUrlPage({ params }: { params: { slug: string } }) {
  const target = await resolveLegacyUrl(params.slug);

  if (target) {
    permanentRedirect(target);
  }

  notFound();
}
