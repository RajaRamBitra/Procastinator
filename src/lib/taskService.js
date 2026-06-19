import { hasSupabaseConfig, supabase, supabaseConfigHint } from './supabase'

const configError = () => new Error(`Supabase is not configured. ${supabaseConfigHint}`)

export async function fetchTasks() {
  if (!hasSupabaseConfig || !supabase) {
    return { data: [], error: configError() }
  }

  const response = await supabase
    .from('tasks')
    .select('id, title, completed, is_main')
    .order('created_at', { ascending: false })

  return response
}

export async function upsertMainTask(task) {
  if (!hasSupabaseConfig || !supabase) {
    return { data: null, error: configError() }
  }

  const mainTaskQuery = await supabase
    .from('tasks')
    .select('id')
    .eq('is_main', true)
    .limit(1)
    .maybeSingle()

  if (mainTaskQuery.error) {
    return { data: null, error: mainTaskQuery.error }
  }

  if (mainTaskQuery.data?.id) {
    return supabase
      .from('tasks')
      .update({ title: task.title, completed: task.completed, is_main: true })
      .eq('id', mainTaskQuery.data.id)
      .select('id, title, completed, is_main')
      .single()
  }

  return supabase
    .from('tasks')
    .insert({ title: task.title, completed: task.completed, is_main: true })
    .select('id, title, completed, is_main')
    .single()
}

export async function logPomodoroSession(session) {
  if (!hasSupabaseConfig || !supabase) {
    return { data: null, error: configError() }
  }

  return supabase
    .from('pomodoro_sessions')
    .insert({
      mode: session.mode,
      duration_minutes: session.durationMinutes,
      completed: session.completed,
      task_id: session.taskId ?? null,
    })
    .select('id, mode, duration_minutes, completed, task_id')
    .single()
}
