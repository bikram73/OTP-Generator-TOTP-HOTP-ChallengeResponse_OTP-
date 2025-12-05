// Test HOTP behavior to ensure same code verifies multiple times
const { HOTPGenerator } = require('./lib/otp/hotp');

async function testHOTPBehavior() {
    console.log('🧪 Testing HOTP Behavior...\n');

    // Create HOTP generator with counter 0
    const hotp = new HOTPGenerator(undefined, 0);
    console.log(`Secret: ${hotp.getSecret()}`);
    console.log(`Initial Counter: ${hotp.getCurrentCounter()}`);

    // Generate current OTP (should not increment counter)
    const currentOTP = hotp.getCurrentOTP();
    console.log(`\n📱 Current OTP: ${currentOTP}`);
    console.log(`Counter after getCurrentOTP(): ${hotp.getCurrentCounter()}`);

    // Verify same code multiple times (should work)
    console.log('\n🔍 Testing multiple verifications of same code:');

    const verify1 = hotp.verifyOTPWithoutIncrement(currentOTP);
    console.log(`Verification 1: ${verify1 ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Counter after verify 1: ${hotp.getCurrentCounter()}`);

    const verify2 = hotp.verifyOTPWithoutIncrement(currentOTP);
    console.log(`Verification 2: ${verify2 ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Counter after verify 2: ${hotp.getCurrentCounter()}`);

    const verify3 = hotp.verifyOTPWithoutIncrement(currentOTP);
    console.log(`Verification 3: ${verify3 ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Counter after verify 3: ${hotp.getCurrentCounter()}`);

    // Generate next OTP (should increment counter)
    console.log('\n🔄 Generating next OTP:');
    const nextOTP = hotp.generateNextOTP();
    console.log(`Next OTP: ${nextOTP}`);
    console.log(`Counter after generateNextOTP(): ${hotp.getCurrentCounter()}`);

    // Old code should now fail
    console.log('\n❌ Testing old code (should fail):');
    const oldVerify = hotp.verifyOTPWithoutIncrement(currentOTP);
    console.log(`Old code verification: ${oldVerify ? '✅ SUCCESS' : '❌ FAILED (Expected)'}`);

    // New code should work
    console.log('\n✅ Testing new code (should work):');
    const newVerify = hotp.verifyOTPWithoutIncrement(nextOTP);
    console.log(`New code verification: ${newVerify ? '✅ SUCCESS' : '❌ FAILED'}`);

    console.log('\n🎯 Expected Behavior:');
    console.log('- Same code verifies multiple times ✅');
    console.log('- Counter only increments on generateNextOTP() ✅');
    console.log('- Old codes fail after new code generated ✅');
}

testHOTPBehavior().catch(console.error);