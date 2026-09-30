// Testimonials shown on /testimonials and on the homepage.
// To add one: copy an entry, change the text, and put the newest at the top.
// Only publish names and companies the person has agreed to.

export type Testimonial = {
  quote: string;
  name: string; // e.g. "Mary K." or "Operations Manager"
  role?: string; // e.g. "Operations Manager"
  company?: string; // e.g. "Dublin manufacturer"
  type: 'employer' | 'temp';
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Disha was great and many thanks for finding her. Will definitely come back to you if we do something similar again.',
    name: 'John',
    role: 'Events Manager',
    type: 'employer',
  },
];
