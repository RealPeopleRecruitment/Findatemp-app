import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Findatemp offers clients over 15 years of recruitment industry knowledge — connecting Dublin companies with vetted, ready-to-work temp staff.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <p className="text-gray-700 mb-6">
        Here at Findatemp we offer our clients over 15 years of recruitment industry knowledge and experience.
      </p>
      <p className="text-gray-700 mb-6">
        Established in 2015, Real People Recruitment was founded with the vision of being a 100%
        people-centric recruitment business. Initially our focus was on permanent recruitment hires
        for our clients&apos; businesses.
      </p>
      <p className="text-gray-700 mb-10">
        However, in 2020, as the company grew, we expanded to offer a best-in-class temporary
        recruitment service to our clients — and so, Find A Temp was born.
      </p>

      <h2 className="text-xl font-semibold mb-3">Our Process</h2>
      <p className="text-gray-700 mb-6">
        Findatemp is a system where our clients can view profiles of people who have outlined that
        they are looking for work and available for temporary work. We ask each of our temps to give
        us a brief outline of their experience, the locations they can commute to, their availability,
        and how much they would like to earn per hour. We then make them available for companies to
        contact them and offer them temporary work.
      </p>

      <h2 className="text-xl font-semibold mb-3">Our Service</h2>
      <p className="text-gray-700 mb-6">
        Findatemp can identify available flexible staff who can travel to your offices, with the
        experience you require, at as little as 1 day&apos;s notice.
      </p>
      <p className="text-gray-700">
        As well as that, we can arrange interviews, offer letters, and even employ the people and
        organise payroll each week. This includes registration with Revenue, bank details, payslips,
        tax calculations, and reference checks if required.
      </p>
    </div>
  );
}
