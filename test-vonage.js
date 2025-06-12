// Simple test script to verify Vonage integration
// Run this with: node test-vonage.js

console.log('🧪 Testing Vonage Integration...\n')

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables:')
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
]

const optionalEnvVars = [
  'VITE_VONAGE_API_KEY',
  'VITE_VONAGE_API_SECRET',
  'VITE_VONAGE_APPLICATION_ID',
  'VITE_VONAGE_DEFAULT_NUMBER'
]

// Load environment variables (in a real test, these would come from .env)
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  console.log(`   ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`)
})

console.log('\n   Optional Vonage variables (for production):')
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  console.log(`   ${envVar}: ${value ? '✅ Set' : '⚠️ Not set (demo mode)'}`)
})

// Test 2: Mock Vonage service
console.log('\n2️⃣ Testing mock Vonage service:')

const mockSendSMS = async (to, text, from) => {
  console.log(`   📱 Mock SMS: ${from} → ${to}`)
  console.log(`   💬 Message: "${text}"`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const success = Math.random() > 0.1 // 90% success rate
  const messageId = `vonage-${Math.random().toString(36).substring(2, 12)}`
  
  if (success) {
    console.log(`   ✅ SMS sent successfully! ID: ${messageId}`)
    return { success: true, messageId }
  } else {
    console.log(`   ❌ SMS failed to send`)
    return { success: false, error: 'Mock failure' }
  }
}

const mockVoiceCall = async (to, message, from) => {
  console.log(`   📞 Mock Voice Call: ${from} → ${to}`)
  console.log(`   🗣️ Message: "${message}"`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const success = Math.random() > 0.1 // 90% success rate
  const callId = `vonage-call-${Math.random().toString(36).substring(2, 12)}`
  
  if (success) {
    console.log(`   ✅ Voice call initiated successfully! ID: ${callId}`)
    return { success: true, callId }
  } else {
    console.log(`   ❌ Voice call failed`)
    return { success: false, error: 'Mock failure' }
  }
}

// Run tests
async function runTests() {
  try {
    // Test SMS
    const smsResult = await mockSendSMS('+1234567890', 'Emergency! Come home now!', '12312345678')
    
    // Test Voice Call
    const voiceResult = await mockVoiceCall('+1234567890', 'This is your boss. There is an urgent situation at work.', '12312345678')
    
    console.log('\n3️⃣ Test Results:')
    console.log(`   SMS Test: ${smsResult.success ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`   Voice Test: ${voiceResult.success ? '✅ PASSED' : '❌ FAILED'}`)
    
    console.log('\n🎉 Vonage integration test completed!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Test scheduling messages in the dashboard')
    console.log('   3. Check browser console for Vonage service logs')
    console.log('   4. For production: Add real Vonage credentials to Supabase Edge Functions')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

runTests()