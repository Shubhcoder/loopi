import type { Edge, Node } from "./flow";
import type { AutomationStep } from "./steps";

export interface Automation {
  id: string;
  name: string;
  description: string;
  nodes: Node[]; // from flow.ts, re-exported via index barrel
  edges: Edge[]; // ditto
  variables?: Record<string, string>;
  steps: AutomationStep[]; // optional: some UIs may use this list view
}

export interface ExecutionLogEntry {
  stepId: string;
  success: boolean;
  error?: string;
  screenshot?: string;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  steps: ExecutionLogEntry[];
}
