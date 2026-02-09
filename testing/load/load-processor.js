/**
 * Artillery Load Test Processor
 * Helper functions for generating test data
 */

const { faker } = require('@faker-js/faker');

// Counter for unique emails
let userCounter = 0;

/**
 * Generate unique user data for registration
 */
function generateUser(requestParams, context, ee, next) {
  userCounter++;
  context.vars.email = `loadtest-${Date.now()}-${userCounter}@test.jocstudio.com`;
  context.vars.password = 'LoadTest123!';
  context.vars.firstName = faker.person.firstName();
  context.vars.lastName = faker.person.lastName();
  context.vars.company = faker.company.name();
  return next();
}

/**
 * Generate project data
 */
function generateProject(requestParams, context, ee, next) {
  context.vars.projectName = `Load Test Project ${faker.number.int({ min: 1000, max: 9999 })}`;
  context.vars.clientName = faker.company.name();
  context.vars.address = faker.location.streetAddress({ useFullAddress: true });
  return next();
}

/**
 * Generate measurement data
 */
function generateMeasurement(requestParams, context, ee, next) {
  const types = ['count', 'length', 'area', 'volume'];
  const units = { count: 'EA', length: 'LF', area: 'SF', volume: 'CY' };
  
  const type = types[Math.floor(Math.random() * types.length)];
  
  context.vars.measurementName = `${faker.word.adjective()} ${faker.word.noun()}`;
  context.vars.measurementType = type;
  context.vars.measurementQuantity = faker.number.float({ min: 10, max: 1000, precision: 0.01 });
  context.vars.measurementUnit = units[type];
  context.vars.measurementUnitCost = faker.number.float({ min: 1, max: 100, precision: 0.01 });
  
  return next();
}

/**
 * Log response for debugging
 */
function logResponse(requestParams, response, context, ee, next) {
  if (response.statusCode >= 400) {
    console.log(`Error ${response.statusCode}: ${response.body}`);
  }
  return next();
}

/**
 * Custom metric tracking
 */
function trackCustomMetric(requestParams, context, ee, next) {
  // Track business metrics
  ee.emit('customStat', {
    stat: 'business.project_created',
    value: 1
  });
  return next();
}

module.exports = {
  generateUser,
  generateProject,
  generateMeasurement,
  logResponse,
  trackCustomMetric,
};
