import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ManageUserRequest {
  action: 'delete' | 'reset_password' | 'resend_invite';
  userId: string;
  email?: string;
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
      throw new Error("Only admins can manage users");
    }

    const { action, userId, email }: ManageUserRequest = await req.json();

    console.log(`Admin ${user.email} performing action: ${action} on user: ${userId}`);

    switch (action) {
      case 'delete':
        // Delete user roles
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Delete profile
        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("user_id", userId);

        // Delete user from auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;

        console.log(`User ${userId} deleted successfully`);
        break;

      case 'reset_password':
        if (!email) throw new Error("Email required for password reset");
        
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
        });

        if (resetError) throw resetError;
        console.log(`Password reset email sent to ${email}`);
        break;

      case 'resend_invite':
        if (!email) throw new Error("Email required to resend invite");
        
        const { error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
        });

        if (inviteError) throw inviteError;
        console.log(`Invite resent to ${email}`);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Action ${action} completed successfully` }),
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