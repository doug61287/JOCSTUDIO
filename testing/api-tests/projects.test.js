/**
 * JOCstudio Projects API Tests
 * Tests project CRUD operations, permissions, and business logic
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { config, factories, validators, testUsers } from './setup.js';

const api = request(config.baseUrl);

describe('Projects API', () => {
  let authToken;
  let userId;
  let createdProjectId;
  let testProject;

  beforeAll(async () => {
    // Create and login test user
    const user = factories.user();
    const registerRes = await api.post('/auth/register').send(user);
    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
    testProject = factories.project();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREATE PROJECT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /projects', () => {
    it('should create a new project', async () => {
      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProject)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(testProject.name);
      expect(res.body.client).toBe(testProject.client);
      expect(res.body.status).toBe('draft');
      expect(res.body.ownerId).toBe(userId);
      expect(validators.isValidUUID(res.body.id)).toBe(true);
      
      createdProjectId = res.body.id;
    });

    it('should create project with all optional fields', async () => {
      const fullProject = factories.project({
        description: 'Test description',
        startDate: new Date().toISOString(),
        estimatedValue: 50000,
        tags: ['residential', 'renovation'],
        customFields: { contractor: 'ABC Corp' },
      });

      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fullProject)
        .expect(201);

      expect(res.body.description).toBe(fullProject.description);
      expect(res.body.estimatedValue).toBe(fullProject.estimatedValue);
      expect(res.body.tags).toEqual(fullProject.tags);
    });

    it('should reject project creation without authentication', async () => {
      const res = await api
        .post('/projects')
        .send(testProject)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject project with missing required fields', async () => {
      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Only description' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/name.*required/i);
    });

    it('should sanitize project name', async () => {
      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.project({ name: '  Project With Spaces  ' }))
        .expect(201);

      expect(res.body.name).toBe('Project With Spaces');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET ALL PROJECTS TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects', () => {
    it('should get all user projects', async () => {
      const res = await api
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
    });

    it('should paginate projects', async () => {
      const res = await api
        .get('/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.projects.length).toBeLessThanOrEqual(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
    });

    it('should filter projects by status', async () => {
      const res = await api
        .get('/projects?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      res.body.projects.forEach(project => {
        expect(project.status).toBe('draft');
      });
    });

    it('should search projects by name', async () => {
      const res = await api
        .get(`/projects?search=${encodeURIComponent(testProject.name.substring(0, 5))}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.projects.some(p => p.name.includes(testProject.name.substring(0, 5)))).toBe(true);
    });

    it('should sort projects', async () => {
      const res = await api
        .get('/projects?sort=createdAt&order=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = res.body.projects.map(p => new Date(p.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should reject without authentication', async () => {
      await api
        .get('/projects')
        .expect(401);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET SINGLE PROJECT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:id', () => {
    it('should get a single project by ID', async () => {
      const res = await api
        .get(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdProjectId);
      expect(res.body.name).toBe(testProject.name);
      expect(res.body).toHaveProperty('measurements');
      expect(res.body).toHaveProperty('files');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await api
        .get(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid UUID format', async () => {
      const res = await api
        .get('/projects/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should not allow access to other users projects', async () => {
      // Create another user
      const otherUser = factories.user();
      const otherRes = await api.post('/auth/register').send(otherUser);
      const otherToken = otherRes.body.token;

      // Try to access first user's project
      const res = await api
        .get(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPDATE PROJECT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PATCH /projects/:id', () => {
    it('should update project name', async () => {
      const newName = 'Updated Project Name';
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: newName })
        .expect(200);

      expect(res.body.name).toBe(newName);
      expect(res.body.updatedAt).not.toBe(res.body.createdAt);
    });

    it('should update project status', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(res.body.status).toBe('in_progress');
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        name: 'Multi-Update Project',
        client: 'New Client',
        estimatedValue: 75000,
      };

      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(res.body.name).toBe(updates.name);
      expect(res.body.client).toBe(updates.client);
      expect(res.body.estimatedValue).toBe(updates.estimatedValue);
    });

    it('should reject invalid status value', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should not allow updating immutable fields', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          id: '00000000-0000-0000-0000-000000000000',
          ownerId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(200);

      // ID and ownerId should remain unchanged
      expect(res.body.id).toBe(createdProjectId);
      expect(res.body.ownerId).toBe(userId);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DUPLICATE PROJECT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /projects/:id/duplicate', () => {
    it('should duplicate a project', async () => {
      const res = await api
        .post(`/projects/${createdProjectId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.id).not.toBe(createdProjectId);
      expect(res.body.name).toMatch(/copy/i);
      expect(res.body.status).toBe('draft'); // Reset to draft
    });

    it('should duplicate project with custom name', async () => {
      const res = await api
        .post(`/projects/${createdProjectId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Custom Duplicate Name' })
        .expect(201);

      expect(res.body.name).toBe('Custom Duplicate Name');
    });

    it('should duplicate measurements along with project', async () => {
      // First, add a measurement to the project
      await api
        .post(`/projects/${createdProjectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.measurement());

      const res = await api
        .post(`/projects/${createdProjectId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Get the duplicated project with measurements
      const dupRes = await api
        .get(`/projects/${res.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dupRes.body.measurements.length).toBeGreaterThan(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE PROJECT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('DELETE /projects/:id', () => {
    let projectToDelete;

    beforeAll(async () => {
      // Create a project specifically for deletion
      const res = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.project({ name: 'To Be Deleted' }));
      projectToDelete = res.body.id;
    });

    it('should delete a project', async () => {
      const res = await api
        .delete(`/projects/${projectToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for deleted project', async () => {
      await api
        .get(`/projects/${projectToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow deleting other users projects', async () => {
      // Create another user and project
      const otherUser = factories.user();
      const otherRes = await api.post('/auth/register').send(otherUser);
      const otherToken = otherRes.body.token;

      // Try to delete first user's project
      await api
        .delete(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT STATUS TRANSITIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Project Status Workflow', () => {
    it('should transition from draft to in_progress', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(res.body.status).toBe('in_progress');
    });

    it('should transition to submitted', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'submitted' })
        .expect(200);

      expect(res.body.status).toBe('submitted');
    });

    it('should transition to won (triggers Hero sequence)', async () => {
      const res = await api
        .patch(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'won' })
        .expect(200);

      expect(res.body.status).toBe('won');
      // Hero sequence should be triggered (tested separately)
    });

    it('should allow transition to lost', async () => {
      // Create new project for this test
      const project = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.project());

      const res = await api
        .patch(`/projects/${project.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'lost' })
        .expect(200);

      expect(res.body.status).toBe('lost');
    });
  });
});
