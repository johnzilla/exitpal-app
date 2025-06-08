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

    // Generate TwiML for voice call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${message}</Say>
    <Pause length="1"/>
    <Say voice="alice">This call was scheduled through ExitPal.</Say>
</Response>`

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })

  } catch (error) {
    console.error('TwiML generation error:', error)
    
    // Return a basic TwiML response even if there's an error
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">This is a call from ExitPal.</Say>
</Response>`

    return new Response(fallbackTwiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  }
})