import { notFound } from 'next/navigation';
import ProjectView from '@/components/ProjectView';
import RealtimeRefresher from '@/components/RealtimeRefresher';
import { supabaseServer } from '@/lib/supabase/server';
import type { Financial, Logistics, Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseServer();

  // Tres consultas en paralelo: una sola espera de red, no tres seguidas.
  const [projectRes, financialsRes, logisticsRes] = await Promise.all([
    db.from('projects').select('*').eq('id', id).single(),
    db.from('financials').select('*').eq('project_id', id).order('date', { ascending: false }),
    db.from('logistics').select('*').eq('project_id', id).order('created_at', { ascending: true }),
  ]);

  if (projectRes.error || !projectRes.data) notFound();

  return (
    <>
      <RealtimeRefresher projectId={id} />
      <ProjectView
        project={projectRes.data as Project}
        financials={(financialsRes.data ?? []) as Financial[]}
        logistics={(logisticsRes.data ?? []) as Logistics[]}
      />
    </>
  );
}
