/**
 * JOCstudio File Upload API Tests
 * Tests PDF upload, file management, and validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import { config, factories, validators } from './setup.js';

const api = request(config.baseUrl);

describe('Files API', () => {
  let authToken;
  let projectId;
  let uploadedFileId;

  beforeAll(async () => {
    // Create user and project
    const user = factories.user();
    const registerRes = await api.post('/auth/register').send(user);
    authToken = registerRes.body.token;

    const project = factories.project();
    const projectRes = await api
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(project);
    projectId = projectRes.body.id;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPLOAD FILE TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /projects/:projectId/files', () => {
    it('should upload a valid PDF file', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        .field('name', 'Test Drawing')
        .field('type', 'blueprint')
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('url');
      expect(res.body.name).toBe('Test Drawing');
      expect(res.body.mimeType).toBe('application/pdf');
      expect(res.body.size).toBeGreaterThan(0);
      expect(validators.isValidUUID(res.body.id)).toBe(true);

      uploadedFileId = res.body.id;
    });

    it('should upload PNG image', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-image.png'))
        .field('name', 'Site Photo')
        .field('type', 'photo')
        .expect(201);

      expect(res.body.mimeType).toBe('image/png');
    });

    it('should upload JPG image', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-image.jpg'))
        .field('name', 'Before Photo')
        .field('type', 'photo')
        .expect(201);

      expect(res.body.mimeType).toBe('image/jpeg');
    });

    it('should reject oversized file (>50MB)', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/large-file.pdf'))
        .field('name', 'Large File')
        .expect(413);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/file.*too.*large|size.*limit|exceed/i);
    });

    it('should reject unsupported file format', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test.exe'))
        .field('name', 'Executable')
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/format|type.*not.*supported|invalid.*file/i);
    });

    it('should reject file without name', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        // Missing name field
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should sanitize filename', async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        .field('name', '../../../etc/passwd')
        .expect(201);

      expect(res.body.name).not.toContain('..');
      expect(res.body.name).not.toContain('/');
    });

    it('should reject upload without authentication', async () => {
      await api
        .post(`/projects/${projectId}/files`)
        .attach('file', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        .field('name', 'Test')
        .expect(401);
    });

    it('should detect and validate PDF content', async () => {
      // Try to upload a file with .pdf extension but non-PDF content
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/fake-pdf.pdf'))
        .field('name', 'Fake PDF')
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/invalid.*pdf|corrupt|not.*valid/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET FILES TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:projectId/files', () => {
    it('should get all files for a project', async () => {
      const res = await api
        .get(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.files)).toBe(true);
      expect(res.body.files.length).toBeGreaterThan(0);
    });

    it('should filter files by type', async () => {
      const res = await api
        .get(`/projects/${projectId}/files?type=blueprint`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      res.body.files.forEach(file => {
        expect(file.type).toBe('blueprint');
      });
    });

    it('should include file metadata', async () => {
      const res = await api
        .get(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const file = res.body.files[0];
      expect(file).toHaveProperty('id');
      expect(file).toHaveProperty('name');
      expect(file).toHaveProperty('url');
      expect(file).toHaveProperty('mimeType');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('createdAt');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET SINGLE FILE TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:projectId/files/:id', () => {
    it('should get file metadata', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(uploadedFileId);
    });

    it('should return 404 for non-existent file', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await api
        .get(`/projects/${projectId}/files/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOWNLOAD FILE TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:projectId/files/:id/download', () => {
    it('should download file content', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/attachment/);
    });

    it('should support range requests for streaming', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=0-1023')
        .expect(206);

      expect(res.headers['content-range']).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PDF THUMBNAIL TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:projectId/files/:id/thumbnail', () => {
    it('should generate thumbnail for PDF', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}/thumbnail`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/image\/(png|jpeg)/);
    });

    it('should support custom thumbnail size', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}/thumbnail?width=200&height=200`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/image/);
    });

    it('should return specific PDF page as thumbnail', async () => {
      const res = await api
        .get(`/projects/${projectId}/files/${uploadedFileId}/thumbnail?page=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/image/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPDATE FILE TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PATCH /projects/:projectId/files/:id', () => {
    it('should update file name', async () => {
      const res = await api
        .patch(`/projects/${projectId}/files/${uploadedFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Renamed Drawing' })
        .expect(200);

      expect(res.body.name).toBe('Renamed Drawing');
    });

    it('should update file type', async () => {
      const res = await api
        .patch(`/projects/${projectId}/files/${uploadedFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'specification' })
        .expect(200);

      expect(res.body.type).toBe('specification');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE FILE TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('DELETE /projects/:projectId/files/:id', () => {
    let fileToDelete;

    beforeAll(async () => {
      const res = await api
        .post(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        .field('name', 'To Delete')
        .field('type', 'other');
      fileToDelete = res.body.id;
    });

    it('should delete a file', async () => {
      const res = await api
        .delete(`/projects/${projectId}/files/${fileToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for deleted file', async () => {
      await api
        .get(`/projects/${projectId}/files/${fileToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should clean up file storage', async () => {
      // Attempting to access file URL should fail
      const fileRes = await api
        .get(`/projects/${projectId}/files/${fileToDelete}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BULK OPERATIONS TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Bulk File Operations', () => {
    it('should upload multiple files at once', async () => {
      const res = await api
        .post(`/projects/${projectId}/files/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', path.join(__dirname, '../fixtures/test-drawing.pdf'))
        .attach('files', path.join(__dirname, '../fixtures/test-image.png'))
        .expect(201);

      expect(res.body.uploaded).toBe(2);
      expect(res.body.files.length).toBe(2);
    });

    it('should delete multiple files at once', async () => {
      // Get current files
      const filesRes = await api
        .get(`/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${authToken}`);

      const fileIds = filesRes.body.files.slice(0, 2).map(f => f.id);

      const res = await api
        .delete(`/projects/${projectId}/files/bulk`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fileIds })
        .expect(200);

      expect(res.body.deleted).toBe(fileIds.length);
    });
  });
});
