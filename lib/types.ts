export type ServiceType = 'Integral' | 'Pintura' | 'Consultoría';
export type ProjectStatus = 'Onboarding' | 'Pre-Producción' | 'Producción' | 'Entrega';
export type FinancialType = 'Ingreso' | 'Egreso';
export type LogisticsCategory = 'Material' | 'Contratista';
export type LogisticsStatus = 'Pendiente' | 'En Curso/Comprado' | 'Finalizado';

export interface Project {
  id: string;
  client_name: string;
  phone_number: string | null;
  service_type: ServiceType;
  status: ProjectStatus;
  total_budget: number;
  start_date: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Fila de la vista project_overview: proyecto + totales precalculados. */
export interface ProjectOverview {
  id: string;
  client_name: string;
  phone_number: string | null;
  service_type: ServiceType;
  status: ProjectStatus;
  total_budget: number;
  start_date: string | null;
  address: string | null;
  ingresos: number;
  egresos: number;
  total_items: number;
  done_items: number;
}

export interface Financial {
  id: string;
  project_id: string;
  type: FinancialType;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface Logistics {
  id: string;
  project_id: string;
  category: LogisticsCategory;
  item_name: string;
  supplier_or_worker_name: string | null;
  expected_cost: number | null;
  real_cost: number | null;
  status: LogisticsStatus;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}
