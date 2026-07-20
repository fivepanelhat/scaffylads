import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  fiveWs,
  governance,
  multimodal,
  problems,
  solution,
} from "@/lib/product-story";

export const metadata = {
  title: "Mission · ScaffyLads",
  description:
    "The 5 W’s, problems we solve, solution, multimodal capture, security and Te Mana Raraunga alignment.",
};

export default function MissionPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Mission"
        title="Why ScaffyLads exists"
        lead="Five W’s, the problems on site, the solution we’ve built, multimodal input, and how we hold security, compliance, governance, and Te Mana Raraunga."
        action={
          <Link href="/ask" className="btn btn-primary">
            Try Ask Scaffy
          </Link>
        }
      />

      {/* 5 W's */}
      <section className="space-y-3" aria-labelledby="five-ws">
        <h2 id="five-ws" className="section-title">
          The 5 W&apos;s
        </h2>
        <div className="five-w-grid">
          {fiveWs.map((item) => (
            <article key={item.w} className="card card-pad five-w-card">
              <p className="five-w-letter">{item.w}</p>
              <h3 className="five-w-title">{item.title}</h3>
              <p className="five-w-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Problems */}
      <section className="space-y-3" aria-labelledby="problems">
        <h2 id="problems" className="section-title">
          Problems we are solving
        </h2>
        <div className="problem-grid">
          {problems.map((p) => (
            <article key={p.title} className="card card-pad problem-card">
              <h3 className="item-title">{p.title}</h3>
              <p className="item-sub">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="space-y-3" aria-labelledby="solution">
        <h2 id="solution" className="section-title">
          {solution.headline}
        </h2>
        <p className="section-lead">{solution.lead}</p>
        <div className="solution-grid">
          {solution.pillars.map((p) => (
            <article key={p.title} className="card card-pad solution-card">
              <h3 className="item-title">{p.title}</h3>
              <p className="item-sub">{p.body}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/logbook" className="btn btn-primary">
            Open logbook
          </Link>
          <Link href="/projects" className="btn">
            Projects
          </Link>
          <Link href="/schedule" className="btn">
            Schedule
          </Link>
          <Link href="/architecture" className="btn">
            Architecture
          </Link>
        </div>
      </section>

      {/* Multimodal */}
      <section className="space-y-3" aria-labelledby="multimodal">
        <h2 id="multimodal" className="section-title">
          {multimodal.headline}
        </h2>
        <div className="mode-grid">
          {multimodal.modes.map((m) => (
            <article key={m.id} className="card card-pad mode-card">
              <p className="mode-id">{m.id}</p>
              <h3 className="item-title">{m.title}</h3>
              <p className="item-sub">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Governance */}
      <section className="space-y-3" aria-labelledby="governance">
        <h2 id="governance" className="section-title">
          {governance.headline}
        </h2>
        <p className="section-lead">{governance.lead}</p>
        <div className="gov-grid">
          {governance.items.map((g) => (
            <article key={g.title} className="card card-pad gov-card">
              <h3 className="item-title">{g.title}</h3>
              <ul className="gov-list">
                {g.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)]">
          Detail:{" "}
          <a
            className="text-[var(--accent-2)] underline"
            href="https://github.com/fivepanelhat/scaffylads/blob/main/COMPLIANCE.md"
            target="_blank"
            rel="noreferrer"
          >
            COMPLIANCE.md
          </a>{" "}
          ·{" "}
          <a
            className="text-[var(--accent-2)] underline"
            href="https://github.com/fivepanelhat/scaffylads/blob/main/CAT_CONGRUENCE.md"
            target="_blank"
            rel="noreferrer"
          >
            CAT_CONGRUENCE.md
          </a>
        </p>
      </section>
    </div>
  );
}
