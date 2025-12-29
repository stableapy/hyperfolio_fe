/**
 * Test script to verify formatPercentage utility consistency
 * This demonstrates that the shared utility handles all edge cases consistently
 */

import { formatPercentage } from '@/lib/utils/formatters';

// Test cases covering all edge cases
const testCases = [
  // Normal cases
  {
    input: 5.123,
    expected: '5.1%',
    description: 'Value < 10%, 1 decimal place',
  },
  {
    input: 12.345,
    expected: '12.35%',
    description: 'Value ≥ 10%, 2 decimal places',
  },
  { input: 0.5, expected: '0.5%', description: 'Small normal percentage' },
  { input: 99.999, expected: '100.00%', description: 'Large percentage' },

  // Edge cases
  { input: 0.001, expected: '<0.01%', description: 'Very small percentage' },
  { input: 0.0099, expected: '<0.01%', description: 'Just below 0.01%' },
  { input: 0.01, expected: '0.0%', description: 'Exactly 0.01%' },
  { input: 0, expected: '0.0%', description: 'Zero' },
  { input: -5, expected: '0%', description: 'Negative value' },
  { input: -0.5, expected: '0%', description: 'Negative small value' },
  { input: NaN, expected: '0%', description: 'NaN' },
  { input: Infinity, expected: '0%', description: 'Infinity' },
  { input: -Infinity, expected: '0%', description: 'Negative Infinity' },

  // Boundary cases
  { input: 9.999, expected: '10.0%', description: 'Just below 10%' },
  { input: 10.0, expected: '10.00%', description: 'Exactly 10%' },
  { input: 10.001, expected: '10.00%', description: 'Just above 10%' },
];

// Run tests
console.log('Testing formatPercentage utility...\n');
let allPassed = true;

testCases.forEach(({ input, expected, description }, index) => {
  const result = formatPercentage(input);
  const passed = result === expected;
  allPassed = allPassed && passed;

  const status = passed ? '✓' : '✗';
  const inputStr = String(input);

  console.log(`${status} Test ${index + 1}: ${description}`);
  console.log(`   Input: ${inputStr}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Actual: ${result}`);
  if (!passed) {
    console.log(`   FAILED`);
  }
  console.log('');
});

if (allPassed) {
  console.log('✓ All tests passed!');
} else {
  console.log('✗ Some tests failed.');
}
