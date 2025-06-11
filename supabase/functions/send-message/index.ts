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

    // Determine which Vonage number to use
    const vonageNumber = profile.is_premium && fromNumber 
      ? fromNumber 
      : Deno.env.get('VONAGE_DEFAULT_NUMBER')

    // Send message via Vonage
    const vonageApiKey = Deno.env.get('VONAGE_API_KEY')
    const vonageApiSecret = Deno.env.get('VONAGE_API_SECRET')

    if (!vonageApiKey || !vonageApiSecret || !vonageNumber) {
      throw new Error('Vonage configuration missing')
    }

    let vonageResponse
    let vonageMessageId

    if (type === 'sms') {
      // Send SMS via Vonage
      const response = await fetch(
        'https://rest.nexmo.com/sms/json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            api_key: vonageApiKey,
            api_secret: vonageApiSecret,
            from: vonageNumber,
            to: to,
            text: content,
          }),
        }
      )

      vonageResponse = await response.json()
      
      if (!response.ok || vonageResponse.messages[0].status !== '0') {
        throw new Error(`Vonage SMS error: ${vonageResponse.messages[0]['error-text'] || 'Unknown error'}`)
      }
      
      vonageMessageId = vonageResponse.messages[0]['message-id']
    } else {
      // Make voice call via Vonage
      const vonageApplicationId = Deno.env.get('VONAGE_APPLICATION_ID')
      const vonagePrivateKey = Deno.env.get('VONAGE_PRIVATE_KEY')
      
      if (!vonageApplicationId || !vonagePrivateKey) {
        throw new Error('Vonage voice configuration missing')
      }

      // Generate JWT for Vonage Voice API (simplified for demo)
      // In production, you'd use a proper JWT library
      const nccoUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-ncco?message=${encodeURIComponent(content)}`
      
      const response = await fetch(
        'https://api.nexmo.com/v1/calls',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vonageApiKey}`, // Simplified - should be JWT
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: [{
              type: 'phone',
              number: to
            }],
            from: {
              type: 'phone',
              number: vonageNumber
            },
            answer_url: [nccoUrl]
          }),
        }
      )

      vonageResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(`Vonage Voice error: ${vonageResponse.error_title || 'Unknown error'}`)
      }
      
      vonageMessageId = vonageResponse.uuid
    }

    // Update message status in database
    const { error: updateError } = await supabaseClient
      .from('messages')
      .update({ 
        status: 'sent',
        // Store Vonage ID for tracking
        vonage_id: vonageMessageId 
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
        vonageId: vonageMessageId,
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