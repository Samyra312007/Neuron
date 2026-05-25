export interface GenomeSequence {
  id: string;
  organization_id: string;
  week_start: string;
  collaboration: number;
  decision_making: number;
  knowledge_flow: number;
  innovation: number;
  resilience: number;
  vitality: number;
  health_score: number;
  summary: string | null;
  created_at: string;
}

export interface DarkMatterReport {
  id: string;
  organization_id: string;
  report_date: string;
  invisible_work_hours: number;
  invisible_work_cost: number;
  shadow_coordination_hours: number;
  shadow_coordination_cost: number;
  unlogged_hours: number;
  unlogged_hours_cost: number;
  meeting_overhead_hours: number;
  meeting_overhead_cost: number;
  context_switching_hours: number;
  context_switching_cost: number;
  total_cost: number;
  summary: string | null;
  created_at: string;
}

export interface ImmuneInfection {
  id: string;
  organization_id: string;
  infection_type: string;
  severity: 'low' | 'medium' | 'high';
  severity_score: number;
  description: string;
  spread_count: number;
  is_active: boolean;
  treatment: string | null;
  detected_at: string;
}

export interface CognitiveLoadMetric {
  id: string;
  organization_id: string;
  metric_date: string;
  workload_score: number;
  interaction_density: number;
  meeting_pressure: number;
  task_fragmentation: number;
  decision_fatigue: number;
  burnout_risk: number;
  composite_score: number;
  team_breakdown: Record<string, number> | null;
  created_at: string;
}

export interface MetabolicMetric {
  id: string;
  organization_id: string;
  metric_date: string;
  decision_cycle_time_hours: number;
  info_half_life_hours: number;
  execution_velocity: number;
  composite_score: number;
  created_at: string;
}

export interface TreemapItem {
  name: string;
  value: number;
  color: string;
  label: string;
  cost: number;
}

export interface BubbleItem {
  id: string;
  label: string;
  value: number;
  color: string;
  severity: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  mock_ai: boolean;
}

export const GENE_LABELS: Record<string, string> = {
  collaboration: 'Collaboration',
  decision_making: 'Decision Making',
  knowledge_flow: 'Knowledge Flow',
  innovation: 'Innovation',
  resilience: 'Resilience',
  vitality: 'Vitality',
};

export const DARK_MATTER_LABELS: Record<string, string> = {
  invisible_work_hours: 'Invisible Work',
  shadow_coordination_hours: 'Shadow Coordination',
  unlogged_hours: 'Unlogged Hours',
  meeting_overhead_hours: 'Meeting Overhead',
  context_switching_hours: 'Context Switching',
};

export const INFECTION_TYPES: Record<string, string> = {
  'Meeting Metastasis': 'Meetings are multiplying and consuming team time',
  'Email Typhoon': 'Communication overload causing signal loss',
  'Context Switching Plague': 'Frequent task switching destroying focus',
  'Knowledge Silos': 'Information trapped within teams',
  'Decision Paralysis': 'Slow decision-making blocking progress',
  'Collaboration Overload': 'Too many cross-team dependencies',
  'Burnout Epidemic': 'Team exhaustion and disengagement',
  'Scope Creep Fever': 'Uncontrolled project expansion',
};
