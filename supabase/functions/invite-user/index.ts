import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  name: string;
  role: 'administrador' | 'gerente' | 'vendedor';
  organizationId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the caller is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "administrador")
      .maybeSingle();

    if (!adminRole) {
      throw new Error("Only admins can invite users");
    }

    const { email, name, role, organizationId }: InviteRequest = await req.json();

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // User already exists, just update their info and resend invitation
      console.log("User already exists, updating and resending invite");
      userId = existingUser.id;

      // Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { name },
      });

      // Update or create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          user_id: userId,
          name,
          email,
          organization_id: organizationId,
        });

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      // Update or create role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({
          user_id: userId,
          role,
          created_by: user.id,
        });

      if (roleError) {
        console.error("Role error:", roleError);
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
        },
      });

      if (createError) {
        throw createError;
      }

      if (!newUser.user) {
        throw new Error("Failed to create user");
      }

      userId = newUser.user.id;

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: userId,
          name,
          email,
          organization_id: organizationId,
        });

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role,
          created_by: user.id,
        });

      if (roleError) {
        console.error("Role error:", roleError);
        throw roleError;
      }
    }

    // Send password reset email so user can set their password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (resetError) {
      console.error("Reset email error:", resetError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});