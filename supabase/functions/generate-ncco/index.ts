import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const message = url.searchParams.get('message') || 'This is a call from ExitPal.'

    // Generate NCCO (Nexmo Call Control Objects) for voice call
    const ncco = [
      {
        action: "talk",
        text: message,
        voiceName: "Amy"
      },
      {
        action: "talk",
        text: "This call was scheduled through ExitPal.",
        voiceName: "Amy"
      }
    ]

    return new Response(JSON.stringify(ncco), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('NCCO generation error:', error)
    
    // Return a basic NCCO response even if there's an error
    const fallbackNcco = [
      {
        action: "talk",
        text: "This is a call from ExitPal.",
        voiceName: "Amy"
      }
    ]

    return new Response(JSON.stringify(fallbackNcco), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})