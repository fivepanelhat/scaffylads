export type ProjectStatus = "planned" | "active" | "on_hold" | "complete";

export type ShiftStatus = "scheduled" | "in_progress" | "done" | "cancelled";

export type Weather = "clear" | "overcast" | "rain" | "wind" | "other";

export interface Project {
  id: string;
  name: string;
  siteAddress: string;
  client: string;
  status: ProjectStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  projectId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  crew: string[];
  status: ShiftStatus;
  notes: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  projectId: string;
  shiftId?: string;
  date: string;
  author: string;
  weather: Weather;
  maxHeightM?: number;
  inspectionDone: boolean;
  crewOnSite: string[];
  workDone: string;
  issues: string;
  nextSteps: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  shifts: Shift[];
  logs: LogEntry[];
}
