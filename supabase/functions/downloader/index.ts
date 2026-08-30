// ============================================================
// DOWNLOADER EDGE FUNCTION
// ============================================================
// This is a server-side function that proxies requests to the
// Cobalt media downloader API. The browser never talks to Cobalt
// directly — it talks to THIS function, which forwards the request.
//
// Why? Cobalt's public API has bot protection that blocks browser
// requests. By going through this server function, we can make the
// request from the server side where it works reliably.
//
// HOW TO CHANGE THE COBALT INSTANCE:
// If the default instance stops working, find another public Cobalt
// instance URL and replace COBALT_API_URL below.
// ============================================================

// --- CORS HEADERS (required for every response) ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- EDIT THIS: the Cobalt API instance URL ---
// You can change this to any public Cobalt instance if the default stops working.
const COBALT_API_URL = "https://api.cobalt.tools";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse the request body from the browser
    const body = await req.json();

    // Forward the request to Cobalt
    const cobaltResponse = await fetch(`${COBALT_API_URL}/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const cobaltData = await cobaltResponse.json();

    // Return Cobalt's response to the browser
    return new Response(JSON.stringify(cobaltData), {
      status: cobaltResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // If something goes wrong, return an error to the browser
    return new Response(
      JSON.stringify({ status: "error", error: { code: "fetch_failed", message: String(err) } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
