/**
 * TEST SUITE: 4-State Status Dot System - Availability Endpoint
 * 
 * Tests the new /v1/presence/availability endpoint
 */

const API_BASE_URL = 'http://localhost:3002';

// Test user credentials
const TEST_USER = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User'
};

const TEST_PAGE_ID = 'test-page-availability-001';

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Log test result
 */
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`${GREEN}✅ PASS${RESET}: ${testName}`);
  } else {
    testResults.failed++;
    console.log(`${RED}❌ FAIL${RESET}: ${testName}`);
    if (details) {
      console.log(`   ${RED}Details: ${details}${RESET}`);
    }
  }
}

// Import fetch for Node.js
const fetch = require('node-fetch');

/**
 * Make API request
 */
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': TEST_USER.id,
      'X-User-Email': TEST_USER.email,
      'X-User-Name': TEST_USER.name,
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { error };
  }
}

/**
 * Test 1: Endpoint exists and responds
 */
async function test1_EndpointExists() {
  console.log(`\n${BLUE}TEST 1: Endpoint Exists${RESET}`);
  
  const { response, data, error } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'AVAILABLE'
  });

  if (error) {
    logTest('Endpoint responds', false, `Network error: ${error.message}`);
    return false;
  }

  logTest('Endpoint responds', response.status !== 404, `Status: ${response.status}`);
  return response.status !== 404;
}

/**
 * Test 2: Authentication required
 */
async function test2_AuthenticationRequired() {
  console.log(`\n${BLUE}TEST 2: Authentication Required${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'AVAILABLE'
  }, {
    'X-User-Id': '', // Empty user ID
    'X-User-Email': '' // Empty email
  });

  const requiresAuth = response.status === 401;
  logTest('Rejects unauthenticated requests', requiresAuth, `Status: ${response.status}`);
  return requiresAuth;
}

/**
 * Test 3: Validates pageId parameter
 */
async function test3_ValidatesPageId() {
  console.log(`\n${BLUE}TEST 3: Validates pageId Parameter${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    availability: 'AVAILABLE'
    // Missing pageId
  });

  const validates = response.status === 400 && data.error && data.error.includes('pageId');
  logTest('Requires pageId parameter', validates, `Status: ${response.status}, Error: ${data.error}`);
  return validates;
}

/**
 * Test 4: Validates availability parameter
 */
async function test4_ValidatesAvailability() {
  console.log(`\n${BLUE}TEST 4: Validates availability Parameter${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID
    // Missing availability
  });

  const validates = response.status === 400 && data.error && data.error.includes('availability');
  logTest('Requires availability parameter', validates, `Status: ${response.status}, Error: ${data.error}`);
  return validates;
}

/**
 * Test 5: Rejects invalid availability values
 */
async function test5_RejectsInvalidAvailability() {
  console.log(`\n${BLUE}TEST 5: Rejects Invalid Availability Values${RESET}`);
  
  const invalidValues = ['INVALID', 'ONLINE', 'OFFLINE', 'TEST', ''];
  let allRejected = true;

  for (const value of invalidValues) {
    const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
      pageId: TEST_PAGE_ID,
      availability: value
    });

    const rejected = response.status === 400;
    logTest(`Rejects invalid value: "${value}"`, rejected, `Status: ${response.status}`);
    
    if (!rejected) {
      allRejected = false;
    }
  }

  return allRejected;
}

/**
 * Test 6: Accepts AVAILABLE status
 */
async function test6_AcceptsAvailable() {
  console.log(`\n${BLUE}TEST 6: Accepts AVAILABLE Status${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'AVAILABLE'
  });

  const success = response.status === 200 && data.success === true;
  logTest('Accepts AVAILABLE status', success, `Status: ${response.status}, Success: ${data.success}`);
  
  if (success) {
    console.log(`   ${GREEN}Response:${RESET}`, JSON.stringify(data, null, 2));
  }
  
  return success;
}

/**
 * Test 7: Accepts BUSY status
 */
async function test7_AcceptsBusy() {
  console.log(`\n${BLUE}TEST 7: Accepts BUSY Status${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'BUSY'
  });

  const success = response.status === 200 && data.success === true;
  logTest('Accepts BUSY status', success, `Status: ${response.status}, Success: ${data.success}`);
  
  if (success) {
    console.log(`   ${YELLOW}Response:${RESET}`, JSON.stringify(data, null, 2));
  }
  
  return success;
}

/**
 * Test 8: Accepts AWAY status
 */
async function test8_AcceptsAway() {
  console.log(`\n${BLUE}TEST 8: Accepts AWAY Status${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'AWAY'
  });

  const success = response.status === 200 && data.success === true;
  logTest('Accepts AWAY status', success, `Status: ${response.status}, Success: ${data.success}`);
  
  if (success) {
    console.log(`   ${RED}Response:${RESET}`, JSON.stringify(data, null, 2));
  }
  
  return success;
}

/**
 * Test 9: Returns presence event data
 */
async function test9_ReturnsPresenceEvent() {
  console.log(`\n${BLUE}TEST 9: Returns Presence Event Data${RESET}`);
  
  const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
    pageId: TEST_PAGE_ID,
    availability: 'AVAILABLE'
  });

  const hasPresenceEvent = data.presenceEvent && 
                          data.availability === 'AVAILABLE' &&
                          data.success === true;
  
  logTest('Returns presence event data', hasPresenceEvent, `Has presenceEvent: ${!!data.presenceEvent}, availability: ${data.availability}`);
  
  if (hasPresenceEvent) {
    console.log(`   ${GREEN}Presence Event:${RESET}`, JSON.stringify(data.presenceEvent, null, 2));
  }
  
  return hasPresenceEvent;
}

/**
 * Test 10: Rapid status changes
 */
async function test10_RapidStatusChanges() {
  console.log(`\n${BLUE}TEST 10: Rapid Status Changes${RESET}`);
  
  const statuses = ['AVAILABLE', 'BUSY', 'AWAY', 'AVAILABLE', 'BUSY'];
  let allSucceeded = true;

  for (let i = 0; i < statuses.length; i++) {
    const { response, data } = await makeRequest('/v1/presence/availability', 'POST', {
      pageId: TEST_PAGE_ID,
      availability: statuses[i]
    });

    const success = response.status === 200;
    if (!success) {
      allSucceeded = false;
      console.log(`   ${RED}Failed on change ${i + 1}: ${statuses[i]}${RESET}`);
    }
  }

  logTest('Handles rapid status changes', allSucceeded);
  return allSucceeded;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${BLUE}4-STATE STATUS DOT SYSTEM - API TESTS${RESET}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test User: ${TEST_USER.email} (${TEST_USER.id})`);
  console.log(`Test Page: ${TEST_PAGE_ID}`);

  try {
    await test1_EndpointExists();
    await test2_AuthenticationRequired();
    await test3_ValidatesPageId();
    await test4_ValidatesAvailability();
    await test5_RejectsInvalidAvailability();
    await test6_AcceptsAvailable();
    await test7_AcceptsBusy();
    await test8_AcceptsAway();
    await test9_ReturnsPresenceEvent();
    await test10_RapidStatusChanges();

  } catch (error) {
    console.error(`\n${RED}Test execution error:${RESET}`, error);
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${BLUE}TEST SUMMARY${RESET}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${GREEN}Passed: ${testResults.passed}${RESET}`);
  console.log(`${RED}Failed: ${testResults.failed}${RESET}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}\n`);

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();

