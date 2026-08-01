import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  PRIMARY_ADMIN_ROLE,
  STAFF_ROLE,
  isAssignableStaffRole,
} from '../_shared/staffRoles.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_NAME_LENGTH = 100;
const MAX_AVATAR_URL_LENGTH = 2_048;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManageStaffRequest = {
  action?: unknown;
  staffId?: unknown;
  role?: unknown;
  name?: unknown;
  avatar?: unknown;
};

const respond = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: corsHeaders });

const isValidStaffId = (value: unknown) => (
  typeof value === 'string' && UUID_PATTERN.test(value)
);

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return respond(401, { error: 'Unauthorized' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('The required Supabase Edge Function environment variables are missing.');
    return respond(500, { error: 'Staff management service is unavailable' });
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return respond(401, { error: 'Unauthorized' });
  }

  const body = await request.json().catch(() => null) as ManageStaffRequest | null;
  const action = body?.action;
  if (action !== 'update-self' && action !== 'change-role' && action !== 'delete') {
    return respond(400, { error: 'Invalid action' });
  }

  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (callerProfileError || !callerProfile) {
    return respond(403, { error: 'Forbidden' });
  }

  if (action === 'update-self') {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const avatar = typeof body?.avatar === 'string' ? body.avatar.trim() : '';

    if (!name || name.length > MAX_NAME_LENGTH || avatar.length > MAX_AVATAR_URL_LENGTH) {
      return respond(400, { error: 'Invalid profile data' });
    }

    const { data: profile, error: updateError } = await adminClient
      .from('profiles')
      .update({ name, avatar })
      .eq('id', userData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Could not update the caller profile.', updateError);
      return respond(500, { error: 'Could not update profile' });
    }

    return respond(200, { profile });
  }

  if (callerProfile.role !== PRIMARY_ADMIN_ROLE) {
    return respond(403, { error: 'Forbidden' });
  }

  const staffId = body?.staffId;
  if (!isValidStaffId(staffId) || staffId === userData.user.id) {
    return respond(400, { error: 'Invalid staff member' });
  }

  const { data: targetProfile, error: targetProfileError } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', staffId)
    .maybeSingle();

  if (targetProfileError) {
    console.error('Could not read the target staff profile.', targetProfileError);
    return respond(500, { error: 'Could not manage staff member' });
  }

  if (!targetProfile) {
    return respond(404, { error: 'Staff member not found' });
  }

  const wouldRemovePrimaryAdmin = targetProfile.role === PRIMARY_ADMIN_ROLE
    && (action === 'delete' || body?.role === STAFF_ROLE);

  if (wouldRemovePrimaryAdmin) {
    const { count, error: primaryAdminCountError } = await adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', PRIMARY_ADMIN_ROLE);

    if (primaryAdminCountError) {
      console.error('Could not count primary administrators.', primaryAdminCountError);
      return respond(500, { error: 'Could not manage staff member' });
    }

    if ((count ?? 0) <= 1) {
      return respond(400, { error: 'At least one primary administrator is required' });
    }
  }

  if (action === 'change-role') {
    if (!isAssignableStaffRole(body?.role)) {
      return respond(400, { error: 'Invalid staff role' });
    }

    const { data: profile, error: roleError } = await adminClient
      .from('profiles')
      .update({ role: body.role })
      .eq('id', staffId)
      .select()
      .single();

    if (roleError) {
      console.error('Could not change the staff role.', roleError);
      return respond(500, { error: 'Could not update staff role' });
    }

    return respond(200, { profile });
  }

  const { error: deleteError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', staffId);

  if (deleteError) {
    console.error('Could not remove the staff profile.', deleteError);
    return respond(500, { error: 'Could not remove staff member' });
  }

  return respond(200, { profile: { id: staffId } });
});
