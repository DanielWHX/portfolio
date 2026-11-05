import { resumeDocument } from "@/lib/portfolio/resume-document";
import PortfolioIcon from "./PortfolioIcon";

export default function ResumeLinks() {
  return (
    <section className="resume-links" aria-label="Resume">
      <h3><PortfolioIcon name="document" size={18} />Resume</h3>
      <div className="resume-links-actions">
        <a href={resumeDocument.href} target="_blank" rel="noreferrer">
          Preview PDF <span aria-hidden="true">↗</span>
        </a>
        <a href={resumeDocument.downloadHref} download={resumeDocument.downloadName}>
          Download PDF <PortfolioIcon name="download" size={16} />
        </a>
      </div>
    </section>
  );
}
