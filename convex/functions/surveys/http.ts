import { httpAction } from "../../_generated/server";
import { api } from "../../_generated/api";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handlePost = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const id = await ctx.runMutation(
      api.functions.surveys.mutations.createSurvey,
      body,
    );
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});

export const handleOptions = httpAction(async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
});
