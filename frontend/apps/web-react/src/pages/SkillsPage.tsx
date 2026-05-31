import { useSkills } from '../api/queries';
import { SkillMeter } from '../components/skills/SkillMeter';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import './pages.css';

export function SkillsPage() {
  const query = useSkills();

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <span className="eyebrow">What I work with</span>
          <h1 className="section-title">Skills</h1>
        </div>
      </div>

      {query.isPending && <LoadingState label="Loading skills…" />}
      {query.isError && (
        <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
      )}
      {query.isSuccess && query.data.length === 0 && (
        <EmptyState message="No skills listed yet." />
      )}
      {query.isSuccess && query.data.length > 0 && (
        <div className="skill-groups">
          {query.data.map((category) => (
            <div key={category.id} className="skill-group reveal">
              <h2 className="section-title skill-group__title">{category.name}</h2>
              <ul className="skill-list">
                {category.skills.map((skill) => (
                  <SkillMeter key={skill.id} skill={skill} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
