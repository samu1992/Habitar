import type { ProjectStatus, ServiceType } from './types';

/** Orden real del proceso. El índice también alimenta el indicador de avance. */
export const STATUSES: ProjectStatus[] = ['Onboarding', 'Pre-Producción', 'Producción', 'Entrega'];

/**
 * Cada estado tiene su chip de color. No es decoración: es el mismo lenguaje
 * de muestras de pintura que usa la página de servicios, y va aclarando a
 * medida que la obra avanza — la última mano es la más clara.
 */
export const STATUS_CHIP: Record<ProjectStatus, string> = {
  'Onboarding': '#79A4EC',
  'Pre-Producción': '#CDBC04',
  'Producción': '#EB754F',
  'Entrega': '#F5F1E2',
};

export const SERVICES: ServiceType[] = ['Integral', 'Pintura', 'Consultoría'];

/**
 * Piso de ganancia del estudio sobre el presupuesto total: nunca debería
 * cobrarse menos de esto, sin importar el tamaño de la obra. Por debajo,
 * el % se pinta en rojo en la pestaña de Finanzas como alerta.
 */
export const MIN_PROFIT_PCT = 30;
