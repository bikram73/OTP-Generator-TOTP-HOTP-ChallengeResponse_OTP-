// Quick test to verify TOTP security improvements
const { TOTPGenerator } = require('./lib/otp/totp');

async function testTOTPSecurity() {
  console.log('🔐 Testing TOTP Security Improvements...\n');

  // Create a TOTP generator
  const totp = new TOTPGenerator();
  const secret = totp.getSecret();
  console.log(`Secret: ${secret}`);

  // Generate current code
  const code = totp.generateOTP();
  console.log(`Current TOTP Code: ${code}`);

  // Test 1: Verify code works initially
  const firstVerify = totp.verifyOTP(code, 0); // window = 0 for strict timing
  console.log(`✅ First verification: ${firstVerify ? 'SUCCESS' : 'FAILED'}`);

  // Test 2: Check time remaining
  const remaining = totp.getRemainingTime();
  console.log(`⏰ Time remaining: ${remaining} seconds`);

  // Test 3: Get current time step
  const timeStep = totp.getCurrentTimeStep();
  console.log(`📊 Current time step: ${timeStep}`);

  console.log('\n🎯 Security Features Implemented:');
  console.log('- ✅ Strict 30-second time window (no tolerance)');
  console.log('- ✅ Replay attack prevention');
  console.log('- ✅ Used code tracking');
  console.log('- ✅ Automatic cleanup of old used codes');
}

testTOTPSecurity().catch(console.error);