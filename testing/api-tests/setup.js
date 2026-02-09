/**
 * JOCstudio API Test Setup
 * Configures test environment, database, and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Test configuration
export const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  testDb: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/jocstudio_test',
  jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
  timeout: 10000,
};

// Test user credentials
export const testUsers = {
  admin: {
    email: 'admin@test.jocstudio.com',
    password: 'Admin123!@#',
    role: 'admin',
  },
  contractor: {
    email: 'contractor@test.jocstudio.com',
    password: 'Contractor123!@#',
    role: 'contractor',
  },
  teamMember: {
    email: 'member@test.jocstudio.com',
    password: 'Member123!@#',
    role: 'member',
  },
};

// Token storage for authenticated requests
export let authTokens = {
  admin: null,
  contractor: null,
  teamMember: null,
};

// Request helper with authentication
export async function authenticatedRequest(request, token) {
  return request.set('Authorization', `Bearer ${token}`);
}

// Clean up test data helper
export async function cleanupTestData(db) {
  // Order matters due to foreign keys
  const tables = [
    'measurements',
    'project_files',
    'project_members',
    'projects',
    'organization_members',
    'organizations',
    'user_sessions',
    'users',
  ];
  
  for (const table of tables) {
    try {
      await db.query(`DELETE FROM ${table} WHERE email LIKE '%@test.jocstudio.com'`);
    } catch (e) {
      // Table might not exist in all environments
    }
  }
}

// Wait for condition helper (for async operations)
export async function waitFor(conditionFn, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

// Generate random test data
export function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.jocstudio.com`;
}

// API response validators
export const validators = {
  isValidUUID: (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },
  
  isValidJWT: (str) => {
    const parts = str.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  },
  
  isValidDate: (str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  },
};

// Mock data factories
export const factories = {
  user: (overrides = {}) => ({
    email: generateTestEmail(),
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    company: 'Test Company',
    ...overrides,
  }),
  
  project: (overrides = {}) => ({
    name: `Test Project ${Date.now()}`,
    client: 'Test Client',
    address: '123 Test Street',
    status: 'draft',
    ...overrides,
  }),
  
  measurement: (overrides = {}) => ({
    name: 'Test Measurement',
    type: 'area',
    quantity: 100,
    unit: 'SF',
    unitCost: 5.00,
    ...overrides,
  }),
};

// Global setup
beforeAll(async () => {
  console.log('🧪 JOCstudio Test Suite Starting...');
  console.log(`📍 API Base URL: ${config.baseUrl}`);
});

// Global teardown
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
});

// Console output formatting
export const log = {
  section: (name) => console.log(`\n━━━ ${name} ━━━`),
  pass: (msg) => console.log(`  ✓ ${msg}`),
  fail: (msg) => console.log(`  ✗ ${msg}`),
  info: (msg) => console.log(`  ℹ ${msg}`),
};
