import { createClient } from 'npm:@supabase/supabase-js@2';
import { PRIMARY_ADMIN_ROLE, STAFF_ROLE } from '../_shared/staffRoles.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const respond = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: corsHeaders });

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
    return respond(500, { error: 'Invitation service is unavailable' });
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

  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (callerProfileError || callerProfile?.role !== PRIMARY_ADMIN_ROLE) {
    return respond(403, { error: 'Forbidden' });
  }

  const body = await request.json().catch(() => null) as { email?: unknown; role?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body?.role === 'string' ? body.role : '';

  if (!EMAIL_PATTERN.test(email) || role !== STAFF_ROLE) {
    return respond(400, { error: 'Invalid invitation data' });
  }

  const { data: existingProfile, error: existingProfileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingProfileError) {
    console.error('Could not check the existing staff profile.', existingProfileError);
    return respond(500, { error: 'Could not create invitation' });
  }

  if (existingProfile) {
    const { data: profile, error: updateError } = await adminClient
      .from('profiles')
      .update({ role })
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Could not update the existing staff profile.', updateError);
      return respond(500, { error: 'Could not create invitation' });
    }

    return respond(200, { profile, invited: false });
  }

  const { data: invitation, error: invitationError } = await adminClient.auth.admin.inviteUserByEmail(email);
  const invitedUserId = invitation.user?.id;

  if (invitationError || !invitedUserId) {
    console.error('Could not create the Supabase Auth invitation.', invitationError);
    return respond(409, { error: 'Could not create invitation' });
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: invitedUserId,
      email,
      role,
      name: email.split('@')[0],
      avatar: '',
      lastLogin: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(invitedUserId);
    console.error('Could not create the staff profile.', profileError);
    return respond(500, { error: 'Could not create invitation' });
  }

  return respond(201, { profile, invited: true });
});
