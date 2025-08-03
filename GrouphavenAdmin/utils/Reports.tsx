import { supabase } from './supabase';

export async function checkSession(): Promise<boolean> {
  if (!supabase) return false;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return false;
  }

  return true;
}

export async function getNextReport() {
    if (!supabase) {
        return false;
    }

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'PENDING')
    .order('report_date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch report:', error);
    return null;
  }

  return data;
}

export async function resolveReport(report_id: string): Promise<boolean> {
    if (!supabase) {
        return false;
    }

  const { error } = await supabase
    .from('reports')
    .update({ status: 'RESOLVED' })
    .eq('report_id', report_id);

  if (error) {
    console.error('Failed to resolve report:', error);
    return false;
  }

  return true;
}

export async function rejectReport(report_id: string): Promise<boolean> {
    if (!supabase) {
        return false;
    }

  const { error } = await supabase
    .from('reports')
    .update({ status: 'REJECTED' })
    .eq('report_id', report_id);

  if (error) {
    console.error('Failed to reject report:', error);
    return false;
  }

  return true;
}
