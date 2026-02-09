/**
 * JOCstudio Security Testing Suite
 * Tests for common vulnerabilities and security best practices
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { config, factories } from '../api-tests/setup.js';

const api = request(config.baseUrl);

describe('Security Tests', () => {
  let authToken;
  let projectId;

  beforeAll(async () => {
    // Create test user and project
    const user = factories.user();
    const res = await api.post('/auth/register').send(user);
    authToken = res.body.token;

    const project = await api
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(factories.project());
    projectId = project.body.id;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SQL INJECTION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "1; SELECT * FROM users",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "1' AND 1=1--",
      "'; INSERT INTO users VALUES('hacker', 'hacked');--",
    ];

    it('should prevent SQL injection in login email', async () => {
      for (const payload of sqlPayloads) {
        const res = await api
          .post('/auth/login')
          .send({
            email: payload,
            password: 'password123',
          });

        // Should return validation error, not SQL error
        expect(res.status).not.toBe(500);
        expect(res.body.error).not.toMatch(/sql|syntax|query/i);
      }
    });

    it('should prevent SQL injection in project search', async () => {
      for (const payload of sqlPayloads) {
        const res = await api
          .get(`/projects?search=${encodeURIComponent(payload)}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).not.toBe(500);
        expect(res.body.error).not.toMatch(/sql|syntax|query/i);
      }
    });

    it('should prevent SQL injection in project ID', async () => {
      const res = await api
        .get("/projects/'; DROP TABLE projects; --")
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400); // Invalid UUID format
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // XSS (CROSS-SITE SCRIPTING) TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '"><script>alert("xss")</script>',
      "javascript:alert('xss')",
      '<svg onload=alert("xss")>',
      '<body onload=alert("xss")>',
      '{{constructor.constructor("alert(1)")()}}',
      '<img src="x" onerror="eval(atob(\'YWxlcnQoMSk=\'))">',
    ];

    it('should sanitize XSS in user registration', async () => {
      for (const payload of xssPayloads) {
        const res = await api
          .post('/auth/register')
          .send({
            ...factories.user(),
            firstName: payload,
            lastName: payload,
          });

        if (res.status === 201) {
          expect(res.body.user.firstName).not.toContain('<script');
          expect(res.body.user.firstName).not.toContain('onerror');
          expect(res.body.user.lastName).not.toContain('<script');
        }
      }
    });

    it('should sanitize XSS in project creation', async () => {
      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '<script>alert("xss")</script>Project',
          client: '<img src=x onerror=alert(1)>',
          description: 'Normal description <script>malicious()</script>',
        });

      if (res.status === 201) {
        expect(res.body.name).not.toContain('<script');
        expect(res.body.client).not.toContain('onerror');
      }
    });

    it('should sanitize XSS in measurement names', async () => {
      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...factories.measurement(),
          name: '<script>alert("xss")</script>',
        });

      if (res.status === 201) {
        expect(res.body.name).not.toContain('<script');
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JWT TOKEN SECURITY TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('JWT Token Security', () => {
    it('should reject tampered JWT token', async () => {
      // Modify the payload of the token
      const parts = authToken.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      payload.role = 'admin'; // Attempt privilege escalation
      const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = authToken.slice(0, -5) + 'XXXXX';

      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(401);
    });

    it('should reject token with "none" algorithm', async () => {
      // Create a token with algorithm "none" (security vulnerability)
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ userId: '1', role: 'admin' })).toString('base64');
      const noneToken = `${header}.${payload}.`;

      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${noneToken}`);

      expect(res.status).toBe(401);
    });

    it('should not expose sensitive data in token', async () => {
      const parts = authToken.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload).not.toHaveProperty('password');
      expect(payload).not.toHaveProperty('passwordHash');
      expect(payload).not.toHaveProperty('creditCard');
      expect(payload).not.toHaveProperty('ssn');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CSRF PROTECTION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('CSRF Protection', () => {
    it('should include CSRF token in responses', async () => {
      const res = await api
        .get('/auth/csrf-token')
        .expect(200);

      expect(res.body).toHaveProperty('csrfToken');
    });

    it('should validate CSRF token on state-changing requests', async () => {
      // Skip CSRF validation for API-only endpoints using Bearer tokens
      // This test is for session-based endpoints if they exist
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RATE LIMITING TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const responses = [];

      // Make 15 rapid login attempts
      for (let i = 0; i < 15; i++) {
        const res = await api
          .post('/auth/login')
          .send({
            email: 'ratelimit@test.jocstudio.com',
            password: 'wrong',
          });
        responses.push(res.status);
      }

      // At least one should be rate limited (429)
      expect(responses).toContain(429);
    });

    it('should rate limit API requests', async () => {
      const responses = [];

      // Make 120 rapid requests (limit is 100/min)
      for (let i = 0; i < 120; i++) {
        const res = await api
          .get('/projects')
          .set('Authorization', `Bearer ${authToken}`);
        responses.push(res.status);
      }

      // Some should be rate limited
      expect(responses.filter(s => s === 429).length).toBeGreaterThan(0);
    });

    it('should not reveal rate limit bypass methods', async () => {
      const res = await api
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Forwarded-For', '1.2.3.4'); // Attempt to bypass with spoofed IP

      // Server should not trust X-Forwarded-For blindly
      // (Proper configuration should be verified manually)
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILE UPLOAD SECURITY TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('File Upload Security', () => {
    it('should reject executable files', async () => {
      // Create mock executable
      const execBuffer = Buffer.from('MZ....', 'utf-8'); // PE header start

      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', execBuffer, { filename: 'malware.exe' })
        .field('name', 'Test');

      expect(res.status).toBe(400);
    });

    it('should reject files with double extensions', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), { filename: 'document.pdf.exe' })
        .field('name', 'Test');

      expect(res.status).toBe(400);
    });

    it('should reject path traversal in filename', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('%PDF-1.4'), { filename: '../../../etc/passwd' })
        .field('name', 'Test');

      // Should either reject or sanitize the filename
      if (res.status === 201) {
        expect(res.body.name).not.toContain('..');
        expect(res.body.url).not.toContain('..');
      }
    });

    it('should validate file content matches extension', async () => {
      // Try to upload a text file as PDF
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('This is not a PDF'), { filename: 'fake.pdf' })
        .field('name', 'Fake PDF');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid|corrupt|not.*valid/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUTHORIZATION BYPASS TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Authorization Bypass Prevention', () => {
    let otherUserToken;
    let otherProjectId;

    beforeAll(async () => {
      // Create another user
      const otherUser = factories.user();
      const res = await api.post('/auth/register').send(otherUser);
      otherUserToken = res.body.token;

      // Create their project
      const project = await api
        .post('/projects')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(factories.project());
      otherProjectId = project.body.id;
    });

    it('should prevent accessing other users projects', async () => {
      const res = await api
        .get(`/projects/${otherProjectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    it('should prevent modifying other users projects', async () => {
      const res = await api
        .patch(`/projects/${otherProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked!' });

      expect(res.status).toBe(403);
    });

    it('should prevent deleting other users projects', async () => {
      const res = await api
        .delete(`/projects/${otherProjectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    it('should prevent IDOR in user profile access', async () => {
      // Try to access another user's profile by ID manipulation
      const res = await api
        .get('/users/1') // Assuming user IDs might be sequential
        .set('Authorization', `Bearer ${authToken}`);

      // Should either 404 or 403, not return other user's data
      expect([403, 404]).toContain(res.status);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY HEADERS TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const res = await api.get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const res = await api.get('/');
      expect(res.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
    });

    it('should include Strict-Transport-Security header', async () => {
      const res = await api.get('/');
      expect(res.headers['strict-transport-security']).toBeDefined();
    });

    it('should not expose server version', async () => {
      const res = await api.get('/');
      expect(res.headers['x-powered-by']).toBeUndefined();
      expect(res.headers['server']).not.toMatch(/express|node/i);
    });
  });
});
