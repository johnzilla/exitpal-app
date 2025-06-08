import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SendMessageRequest {
  messageId: string
  to: string
  content: string
  type: 'sms' | 'voice'
  fromNumber?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { messageId, to, content, type, fromNumber }: SendMessageRequest = await req.json()

    // Validate input
    if (!messageId || !to || !content || !type) {
      throw new Error('Missing required fields')
    }

    // Get user profile to check premium status and usage
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Failed to get user profile')
    }

    // Check daily usage limits
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todayMessages, error: usageError } = await supabaseClient
      .from('messages')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'sent')
      .gte('created_at', today.toISOString())

    if (usageError) {
      throw new Error('Failed to check usage')
    }

    // Apply usage limits
    const dailyLimit = profile.is_premium ? 50 : 3
    if (todayMessages.length >= dailyLimit) {
      throw new Error(`Daily limit of ${dailyLimit} messages reached`)
    }

    // Determine which Twilio number to use
    const twilioNumber = profile.is_premium && fromNumber 
      ? fromNumber 
      : Deno.env.get('TWILIO_DEFAULT_NUMBER')

    // Send message via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken || !twilioNumber) {
      throw new Error('Twilio configuration missing')
    }

    let twilioResponse
    let twilioMessageId

    if (type === 'sms') {
      // Send SMS
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioNumber,
            To: to,
            Body: content,
          }),
        }
      )

      twilioResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(`Twilio SMS error: ${twilioResponse.message || 'Unknown error'}`)
      }
      
      twilioMessageId = twilioResponse.sid
    } else {
      // Make voice call
      const twimlUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-twiml?message=${encodeURIComponent(content)}`
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioNumber,
            To: to,
            Url: twimlUrl,
          }),
        }
      )

      twilioResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(`Twilio Voice error: ${twilioResponse.message || 'Unknown error'}`)
      }
      
      twilioMessageId = twilioResponse.sid
    }

    // Update message status in database
    const { error: updateError } = await supabaseClient
      .from('messages')
      .update({ 
        status: 'sent',
        // Store Twilio SID for tracking
        twilio_sid: twilioMessageId 
      })
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update message status:', updateError)
      // Don't throw here - message was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        twilioSid: twilioMessageId,
        type: type 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Send message error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send message' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})