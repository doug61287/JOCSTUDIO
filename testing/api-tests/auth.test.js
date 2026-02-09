/**
 * JOCstudio Authentication API Tests
 * Tests user registration, login, token management, and protected routes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { config, factories, validators, testUsers, authTokens } from './setup.js';

const api = request(config.baseUrl);

describe('Authentication API', () => {
  let testUser;
  let userToken;
  let refreshToken;

  beforeAll(() => {
    testUser = factories.user();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGISTRATION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await api
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password'); // Password should not be returned
      expect(validators.isValidJWT(res.body.token)).toBe(true);
      
      userToken = res.body.token;
    });

    it('should reject registration with existing email', async () => {
      const res = await api
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/email.*already.*exists/i);
    });

    it('should reject registration with invalid email format', async () => {
      const res = await api
        .post('/auth/register')
        .send({
          ...factories.user(),
          email: 'invalid-email',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/email/i);
    });

    it('should reject registration with weak password', async () => {
      const res = await api
        .post('/auth/register')
        .send({
          ...factories.user(),
          password: '123', // Too weak
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/password/i);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await api
        .post('/auth/register')
        .send({
          email: factories.user().email,
          // Missing password, firstName, lastName
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should sanitize input and prevent XSS', async () => {
      const xssUser = factories.user({
        firstName: '<script>alert("xss")</script>',
        lastName: 'Normal Name',
      });

      const res = await api
        .post('/auth/register')
        .send(xssUser)
        .expect(201);

      expect(res.body.user.firstName).not.toContain('<script>');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGIN TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(validators.isValidJWT(res.body.token)).toBe(true);
      
      userToken = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should reject login with wrong password', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/invalid.*credentials/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await api
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.jocstudio.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with empty credentials', async () => {
      const res = await api
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should rate limit after multiple failed attempts', async () => {
      const email = factories.user().email;
      
      // Attempt 10 failed logins
      for (let i = 0; i < 10; i++) {
        await api
          .post('/auth/login')
          .send({ email, password: 'wrong' });
      }

      // 11th attempt should be rate limited
      const res = await api
        .post('/auth/login')
        .send({ email, password: 'wrong' })
        .expect(429);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/too many.*attempts|rate limit/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOKEN REFRESH TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const res = await api
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(validators.isValidJWT(res.body.token)).toBe(true);
      
      // Update tokens for subsequent tests
      userToken = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should reject refresh with invalid token', async () => {
      const res = await api
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject refresh with expired token', async () => {
      // Using a known expired token (for testing purposes)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDAwMDAwMDB9.fake';
      
      const res = await api
        .post('/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROTECTED ROUTES TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject protected route without token', async () => {
      const res = await api
        .get('/auth/me')
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/unauthorized|token.*required/i);
    });

    it('should reject protected route with invalid token', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject protected route with malformed authorization header', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', userToken) // Missing 'Bearer' prefix
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGOUT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /auth/logout', () => {
    it('should logout and invalidate token', async () => {
      const res = await api
        .post('/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should reject subsequent requests with logged out token', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PASSWORD RESET TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Password Reset Flow', () => {
    it('should request password reset for existing email', async () => {
      const res = await api
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(res.body).toHaveProperty('message');
      // Should not reveal if email exists for security
    });

    it('should not reveal if email does not exist', async () => {
      const res = await api
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@test.jocstudio.com' })
        .expect(200);

      // Same response as valid email for security
      expect(res.body).toHaveProperty('message');
    });

    it('should reject invalid reset token', async () => {
      const res = await api
        .post('/auth/reset-password')
        .send({
          token: 'invalid-reset-token',
          password: 'NewPassword123!',
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });
});
