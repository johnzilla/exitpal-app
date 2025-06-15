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
    console.log('🚀 Edge Function called:', req.method, req.url)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('🔧 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    console.log('👤 User auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    })

    if (authError || !user) {
      throw new Error(`Unauthorized: ${authError?.message || 'No user'}`)
    }

    // Parse request body
    const requestBody = await req.json()
    console.log('📝 Request body:', requestBody)

    const { messageId, to, content, type, fromNumber }: SendMessageRequest = requestBody

    // Validate input
    if (!messageId || !to || !content || !type) {
      const missing = []
      if (!messageId) missing.push('messageId')
      if (!to) missing.push('to')
      if (!content) missing.push('content')
      if (!type) missing.push('type')
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    console.log('✅ Input validation passed')

    // Get user profile to check premium status and usage
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    console.log('👤 Profile result:', { profile, profileError: profileError?.message })

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`)
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

    console.log('📊 Usage check:', { 
      todayCount: todayMessages?.length || 0, 
      usageError: usageError?.message 
    })

    if (usageError) {
      throw new Error(`Failed to check usage: ${usageError.message}`)
    }

    // Apply usage limits
    const dailyLimit = profile.is_premium ? 50 : 3
    if (todayMessages && todayMessages.length >= dailyLimit) {
      throw new Error(`Daily limit of ${dailyLimit} messages reached`)
    }

    // Get Vonage configuration
    const vonageApiKey = Deno.env.get('VONAGE_API_KEY')
    const vonageApiSecret = Deno.env.get('VONAGE_API_SECRET')
    const vonageDefaultNumber = Deno.env.get('VONAGE_DEFAULT_NUMBER')

    console.log('🔧 Vonage config check:', {
      hasApiKey: !!vonageApiKey,
      hasApiSecret: !!vonageApiSecret,
      hasDefaultNumber: !!vonageDefaultNumber,
      defaultNumber: vonageDefaultNumber
    })

    if (!vonageApiKey || !vonageApiSecret || !vonageDefaultNumber) {
      throw new Error('Vonage configuration missing - check environment variables')
    }

    // Determine which Vonage number to use
    const vonageNumber = profile.is_premium && fromNumber 
      ? fromNumber 
      : vonageDefaultNumber

    console.log('📞 Using Vonage number:', vonageNumber)

    let vonageResponse
    let vonageMessageId

    if (type === 'sms') {
      console.log('📱 Sending SMS via Vonage...')
      
      // Send SMS via Vonage
      const smsBody = new URLSearchParams({
        api_key: vonageApiKey,
        api_secret: vonageApiSecret,
        from: vonageNumber,
        to: to,
        text: content,
      })

      console.log('📤 SMS request params:', {
        from: vonageNumber,
        to: to,
        text: content.substring(0, 50) + '...'
      })

      const response = await fetch(
        'https://rest.nexmo.com/sms/json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: smsBody,
        }
      )

      vonageResponse = await response.json()
      console.log('📱 Vonage SMS response:', vonageResponse)
      
      if (!response.ok) {
        throw new Error(`Vonage API error: HTTP ${response.status}`)
      }

      if (!vonageResponse.messages || vonageResponse.messages.length === 0) {
        throw new Error('Vonage returned no messages')
      }

      const message = vonageResponse.messages[0]
      if (message.status !== '0') {
        throw new Error(`Vonage SMS error: ${message['error-text'] || 'Unknown error'} (status: ${message.status})`)
      }
      
      vonageMessageId = message['message-id']
      console.log('✅ SMS sent successfully, ID:', vonageMessageId)

    } else {
      // Voice call functionality
      console.log('📞 Voice calls not fully implemented yet')
      throw new Error('Voice calls are not yet implemented')
    }

    // Update message status in database
    console.log('💾 Updating message status in database...')
    const { error: updateError } = await supabaseClient
      .from('messages')
      .update({ 
        status: 'sent',
        vonage_id: vonageMessageId 
      })
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('❌ Failed to update message status:', updateError)
      // Don't throw here - message was sent successfully
    } else {
      console.log('✅ Message status updated successfully')
    }

    const successResponse = { 
      success: true, 
      vonageId: vonageMessageId,
      type: type 
    }

    console.log('🎉 Function completed successfully:', successResponse)

    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    
    const errorResponse = { 
      error: error.message || 'Failed to send message',
      details: error.stack || 'No stack trace available'
    }

    console.log('❌ Returning error response:', errorResponse)
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})