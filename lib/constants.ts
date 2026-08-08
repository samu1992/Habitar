import type { ProjectStatus, ServiceType } from './types';

/** Orden real del proceso. El índice también alimenta el indicador de avance. */
export const STATUSES: ProjectStatus[] = ['Onboarding', 'Pre-Producción', 'Producción', 'Entrega'];

/**
 * Cada estado tiene su chip de color. No es decoración: es el mismo lenguaje
 * de muestras de pintura que usa la página de servicios, y va aclarando a
 * medida que la obra avanza — la última mano es la más clara.
 */
export const STATUS_CHIP: Record<ProjectStatus, string> = {
  'Onboarding': '#8FA382',
  'Pre-Producción': '#C79A56',
  'Producción': '#D0805A',
  'Entrega': '#E8DFCB',
};

export const SERVICES: ServiceType[] = ['Integral', 'Pintura', 'Consultoría'];
