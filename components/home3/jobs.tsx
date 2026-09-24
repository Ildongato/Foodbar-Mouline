import { ArrowRight } from 'lucide-react';
import { business } from '@/lib/business';

const vacancies = [
  { title: 'Student / flexi', detail: 'Woensdag · 10u–16u30' },
  { title: 'Vaste zaalmedewerker', detail: 'Halftijds · 19u/week' },
];

export default function Jobs() {
  return (
    <section
      id="vacatures"
      className="jobs-section container"
      aria-labelledby="jobs-heading"
    >
      <h2 id="jobs-heading">Werken bij Mouline</h2>
      {vacancies.map((job) => (
        <div className="job" key={job.title}>
          <h3>{job.title}</h3>
          <p>{job.detail}</p>
          <a
            className="text-link"
            href={`mailto:${business.email}?subject=${encodeURIComponent(`Sollicitatie: ${job.title}`)}`}
            aria-label={`Solliciteer als ${job.title.toLowerCase()}`}
          >
            Solliciteer <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      ))}
    </section>
  );
}
