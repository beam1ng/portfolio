import { useEducation, useExperience, useProfile } from '../api/queries';
import { Markdown } from '../components/ui/Markdown';
import { ErrorState, LoadingState } from '../components/ui/States';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { formatDateRange, formatMonthYear, splitBio } from '../lib/format';
import './pages.css';

export function ResumePage() {
  const profile = useProfile();
  const experience = useExperience();
  const education = useEducation();
  useDocumentTitle('Résumé');

  if (profile.isPending || experience.isPending || education.isPending) {
    return <LoadingState label="Loading résumé…" />;
  }
  if (profile.isError) {
    return <ErrorState message={profile.error.message} onRetry={() => void profile.refetch()} />;
  }
  if (experience.isError) {
    return <ErrorState message={experience.error.message} onRetry={() => void experience.refetch()} />;
  }
  if (education.isError) {
    return <ErrorState message={education.error.message} onRetry={() => void education.refetch()} />;
  }

  const { fullName, headline, bio } = profile.data;
  const { lead, rest } = splitBio(bio);
  const bioParagraphs = [lead, ...rest].filter((p) => p.length > 0);
  const experienceItems = experience.data;
  const educationItems = education.data;

  return (
    <>
      <section className="container hero">
        <div className="reveal">
          <span className="eyebrow">{headline}</span>
          <h1 className="display hero__headline">{fullName}</h1>
        </div>
      </section>

      {bioParagraphs.length > 0 && (
        <section className="container section" aria-labelledby="about-heading">
          <div className="section-head">
            <h2 className="section-title" id="about-heading">About</h2>
          </div>
          <div className="prose reveal">
            {bioParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {experienceItems.length > 0 && (
        <section className="container section" aria-labelledby="experience-heading">
          <div className="section-head">
            <h2 className="section-title" id="experience-heading">Experience</h2>
          </div>
          <ol className="timeline reveal">
            {experienceItems.map((item) => (
              <li key={item.id} className="timeline__item">
                <div className="timeline__meta">
                  <span className="timeline__dates">{formatDateRange(item.startDate, item.endDate)}</span>
                  {item.location && <span className="timeline__loc">{item.location}</span>}
                </div>
                <div className="timeline__body">
                  <h3 className="timeline__role">{item.role}</h3>
                  <p className="timeline__org">{item.company}</p>
                  {item.summary && <Markdown className="timeline__summary">{item.summary}</Markdown>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {educationItems.length > 0 && (
        <section className="container section" aria-labelledby="education-heading">
          <div className="section-head">
            <h2 className="section-title" id="education-heading">Education &amp; certifications</h2>
          </div>
          <ol className="timeline reveal">
            {educationItems.map((item) => (
              <li key={item.id} className="timeline__item">
                <div className="timeline__meta">
                  <span className="timeline__dates">
                    {formatDateRange(item.startDate, item.endDate) ?? formatMonthYear(item.endDate)}
                  </span>
                </div>
                <div className="timeline__body">
                  <h3 className="timeline__role">{item.credential}</h3>
                  <p className="timeline__org">
                    {item.url ? (
                      <a className="text-link" href={item.url} target="_blank" rel="noreferrer noopener">
                        {item.school}
                      </a>
                    ) : (
                      item.school
                    )}
                    {item.field && <span className="muted"> · {item.field}</span>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
