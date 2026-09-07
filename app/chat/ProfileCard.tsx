import Image from "next/image";
import AnimatedText from "./AnimatedText";

import type { ResumeOverviewCard } from "@/lib/portfolio/resume-profile";

export default function ProfileCard({ profile }: { profile: ResumeOverviewCard }) {
  return (
    <article className="profile-card" aria-label={`${profile.name} profile`}>
      <header className="profile-card-header">
        <div className="profile-card-portrait">
          <Image
            src={profile.portrait}
            width={1132}
            height={1390}
            alt={`${profile.name}, wearing glasses and a navy T-shirt`}
            unoptimized
          />
        </div>
        <div className="profile-card-intro">
          <p className="profile-card-kicker">A little about me <span aria-hidden="true">👋</span></p>
          <h2>{profile.name}</h2>
          <p className="profile-card-headline">{profile.headline}</p>
          <p className="profile-card-summary"><AnimatedText text={profile.summary} /></p>
          <ul className="profile-card-interests" aria-label="Interests">
            {profile.interests.map((interest, index) => (
              <li key={interest}><span aria-hidden="true">{index === 0 ? "💪" : "🚀"}</span> {interest}</li>
            ))}
          </ul>
        </div>
      </header>

      <section className="profile-card-education" aria-label="Education">
        <h3><span aria-hidden="true">🎓</span> Education</h3>
        <div className="profile-card-schools">
          {profile.schools.map((school) => (
            <section className={`profile-school profile-school-${school.id}`} key={school.id} aria-label={school.school}>
              <div className="profile-school-heading">
                <div className="profile-school-logo">
                  <Image src={school.logo} width={44} height={52} alt={`${school.school} logo`} unoptimized />
                </div>
                <div>
                  <h4>{school.school}</h4>
                  <p>{school.degree}</p>
                  <p className="profile-school-period">{school.period}</p>
                </div>
              </div>
              <a className="profile-school-ranking" href={school.ranking.sourceUrl} target="_blank" rel="noreferrer">
                {school.ranking.publisher} {school.ranking.year} · {school.ranking.label} <span aria-hidden="true">↗</span>
              </a>
              {"programRanking" in school ? (
                <a className="profile-school-badge" href={school.programRanking.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${school.programRanking.label}, ${school.programRanking.category}, U.S. News ${school.programRanking.year}`}>
                  <span>{school.programRanking.label}</span>
                  <span>Graduate · U.S. News {school.programRanking.year} <span aria-hidden="true">↗</span></span>
                </a>
              ) : null}
            </section>
          ))}
        </div>
      </section>

      <section className="profile-card-experience" aria-label="Experience">
        <h3><span aria-hidden="true">💻</span> Where I&apos;ve been building</h3>
        <ul>{profile.experience.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <ul className="profile-card-skills" aria-label="Core skills">
        {profile.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </article>
  );
}
