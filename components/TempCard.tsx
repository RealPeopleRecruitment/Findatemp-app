import Link from 'next/link';

type TempCardProps = {
  id: string;
  fullName: string;
  areaName: string;
  categoryNames: string[];
  payMin: number;
  payMax: number;
  drives: boolean;
  bullet1: string;
};

export default function TempCard({
  id,
  fullName,
  areaName,
  categoryNames,
  payMin,
  payMax,
  drives,
  bullet1,
}: TempCardProps) {
  // First name + last initial only, for privacy on public listing pages.
  const displayName = fullName.trim().split(' ').length > 1
    ? `${fullName.trim().split(' ')[0]} ${fullName.trim().split(' ').slice(-1)[0][0]}.`
    : fullName;

  return (
    <Link href={`/temp/${id}`} className="card block">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{displayName}</h3>
{drives ? <span className="tag">🚗 Driver</span> : <span className="tag">🚌 Public Transport</span>}      </div>
      <p className="text-sm text-gray-500 mb-3">{areaName}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categoryNames.map((name) => (
          <span key={name} className="tag">{name}</span>
        ))}
      </div>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{bullet1}</p>
      <p className="font-bold text-brand">
        €{Number(payMin).toFixed(2)}–€{Number(payMax).toFixed(2)}/hr
      </p>
    </Link>
  );
}
