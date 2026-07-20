import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker: string;
  title: string;
  lead?: string;
  action?: ReactNode;
};

/** Consistent page titles across ScaffyLads (fleet UI rhythm). */
export function PageHeader({ kicker, title, lead, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <p className="page-kicker">{kicker}</p>
        <h1 className="page-title">{title}</h1>
        {lead ? <p className="page-lead">{lead}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  );
}
