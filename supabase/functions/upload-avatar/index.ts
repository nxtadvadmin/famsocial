import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Ensure avatars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "avatars")) {
      await supabase.storage.createBucket("avatars", {
        public: true,
        allowedMimeTypes: ["image/*"],
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileId = formData.get("profileId") as string;

    if (!file || !profileId) {
      return new Response(
        JSON.stringify({ error: "Missing file or profileId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ext = file.name.split(".").pop() || "png";
    const filePath = `avatars/${profileId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profileId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Upload failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
