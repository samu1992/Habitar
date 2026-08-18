export type ServiceType = 'Integral' | 'Pintura' | 'Consultoría';
export type ProjectStatus = 'Onboarding' | 'Pre-Producción' | 'Producción' | 'Entrega';
export type FinancialType = 'Ingreso' | 'Egreso';
export type LogisticsCategory = 'Material' | 'Contratista' | 'Shopping List';
export type LogisticsStatus = 'Pendiente' | 'En Curso/Comprado' | 'Finalizado';

export interface Project {
  id: string;
  client_name: string;
  phone_number: string | null;
  service_type: ServiceType;
  status: ProjectStatus;
  total_budget: number;
  /** Ganancia del estudio como % del presupuesto total (ej. 30 = 30%). */
  studio_profit_pct: number;
  start_date: string | null;
  address: string | null;
  notes: string | null;
  cover_image_url: string | null;
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
  cover_image_url: string | null;
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
  /** Si no es null, este movimiento lo generó automáticamente un ítem de
   * logística al marcarse como comprado/finalizado. No se edita ni se borra
   * a mano: se sincroniza solo desde Logística. */
  linked_logistic_id: string | null;
}

export interface Logistics {
  id: string;
  project_id: string;
  category: LogisticsCategory;
  item_name: string;
  supplier_or_worker_name: string | null;
  description: string | null;
  expected_cost: number | null;
  real_cost: number | null;
  status: LogisticsStatus;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}
