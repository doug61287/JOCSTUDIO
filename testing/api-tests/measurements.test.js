/**
 * JOCstudio Measurements API Tests
 * Tests measurement CRUD, geometry validation, and calculations
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { config, factories, validators } from './setup.js';

const api = request(config.baseUrl);

describe('Measurements API', () => {
  let authToken;
  let projectId;
  let measurementId;

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
  // CREATE MEASUREMENT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /projects/:projectId/measurements', () => {
    it('should create a count measurement', async () => {
      const measurement = {
        name: 'Door Count',
        type: 'count',
        quantity: 15,
        unit: 'EA',
        unitCost: 250.00,
        catalogId: null,
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.type).toBe('count');
      expect(res.body.quantity).toBe(15);
      expect(res.body.total).toBe(15 * 250);
      expect(validators.isValidUUID(res.body.id)).toBe(true);

      measurementId = res.body.id;
    });

    it('should create a length measurement', async () => {
      const measurement = {
        name: 'Baseboard Linear Feet',
        type: 'length',
        quantity: 120.5,
        unit: 'LF',
        unitCost: 3.50,
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [50, 0], [50, 20], [0, 20]],
        },
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.type).toBe('length');
      expect(res.body.geometry).toBeDefined();
    });

    it('should create an area measurement', async () => {
      const measurement = {
        name: 'Floor Area',
        type: 'area',
        quantity: 2500,
        unit: 'SF',
        unitCost: 12.00,
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [100, 0], [100, 50], [0, 50], [0, 0]]],
        },
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.type).toBe('area');
      expect(res.body.total).toBe(2500 * 12);
    });

    it('should create a volume measurement', async () => {
      const measurement = {
        name: 'Concrete Volume',
        type: 'volume',
        quantity: 150,
        unit: 'CY',
        unitCost: 175.00,
        depth: 6, // inches
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.type).toBe('volume');
    });

    it('should validate geometry for area measurement', async () => {
      // Invalid polygon (not closed)
      const measurement = {
        name: 'Invalid Area',
        type: 'area',
        quantity: 100,
        unit: 'SF',
        unitCost: 10.00,
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [100, 0], [100, 50]]], // Not closed
        },
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/geometry|polygon/i);
    });

    it('should link measurement to UPB catalog item', async () => {
      const measurement = {
        name: 'UPB Linked Item',
        type: 'area',
        quantity: 500,
        unit: 'SF',
        unitCost: 15.00,
        catalogId: 'UPB-2024-FLOORING-001',
        catalogDescription: 'Ceramic Tile Installation',
      };

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.catalogId).toBe(measurement.catalogId);
    });

    it('should reject measurement with negative quantity', async () => {
      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.measurement({ quantity: -100 }))
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject measurement with invalid type', async () => {
      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.measurement({ type: 'invalid_type' }))
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET MEASUREMENTS TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('GET /projects/:projectId/measurements', () => {
    it('should get all measurements for a project', async () => {
      const res = await api
        .get(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body.measurements)).toBe(true);
      expect(res.body.measurements.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('summary');
      expect(res.body.summary).toHaveProperty('totalValue');
    });

    it('should filter measurements by type', async () => {
      const res = await api
        .get(`/projects/${projectId}/measurements?type=count`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      res.body.measurements.forEach(m => {
        expect(m.type).toBe('count');
      });
    });

    it('should include geometry data when requested', async () => {
      const res = await api
        .get(`/projects/${projectId}/measurements?includeGeometry=true`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Some measurements should have geometry
      const withGeometry = res.body.measurements.filter(m => m.geometry);
      expect(withGeometry.length).toBeGreaterThan(0);
    });

    it('should calculate totals correctly', async () => {
      const res = await api
        .get(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify each measurement total
      res.body.measurements.forEach(m => {
        expect(m.total).toBe(m.quantity * m.unitCost);
      });

      // Verify summary total
      const calculatedTotal = res.body.measurements.reduce((sum, m) => sum + m.total, 0);
      expect(res.body.summary.totalValue).toBeCloseTo(calculatedTotal, 2);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPDATE MEASUREMENT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PATCH /projects/:projectId/measurements/:id', () => {
    it('should update measurement quantity', async () => {
      const res = await api
        .patch(`/projects/${projectId}/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(res.body.quantity).toBe(20);
      expect(res.body.total).toBe(20 * res.body.unitCost);
    });

    it('should update measurement unit cost', async () => {
      const res = await api
        .patch(`/projects/${projectId}/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ unitCost: 300 })
        .expect(200);

      expect(res.body.unitCost).toBe(300);
      expect(res.body.total).toBe(res.body.quantity * 300);
    });

    it('should update measurement geometry', async () => {
      const newGeometry = {
        type: 'Point',
        coordinates: [50, 50],
      };

      const res = await api
        .patch(`/projects/${projectId}/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ geometry: newGeometry })
        .expect(200);

      expect(res.body.geometry).toEqual(newGeometry);
    });

    it('should reject invalid updates', async () => {
      const res = await api
        .patch(`/projects/${projectId}/measurements/${measurementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 'not-a-number' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BATCH CREATE MEASUREMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('POST /projects/:projectId/measurements/batch', () => {
    it('should create multiple measurements at once', async () => {
      const measurements = [
        factories.measurement({ name: 'Batch Item 1', quantity: 10 }),
        factories.measurement({ name: 'Batch Item 2', quantity: 20 }),
        factories.measurement({ name: 'Batch Item 3', quantity: 30 }),
      ];

      const res = await api
        .post(`/projects/${projectId}/measurements/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ measurements })
        .expect(201);

      expect(res.body.created).toBe(3);
      expect(res.body.measurements.length).toBe(3);
    });

    it('should handle partial failures in batch', async () => {
      const measurements = [
        factories.measurement({ name: 'Valid Item', quantity: 10 }),
        factories.measurement({ name: 'Invalid Item', quantity: -5 }), // Invalid
      ];

      const res = await api
        .post(`/projects/${projectId}/measurements/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ measurements })
        .expect(207); // Multi-status

      expect(res.body.created).toBe(1);
      expect(res.body.failed).toBe(1);
      expect(res.body.errors).toHaveLength(1);
    });

    it('should reject empty batch', async () => {
      const res = await api
        .post(`/projects/${projectId}/measurements/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ measurements: [] })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should limit batch size', async () => {
      const measurements = Array(101).fill(factories.measurement());

      const res = await api
        .post(`/projects/${projectId}/measurements/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ measurements })
        .expect(400);

      expect(res.body.error).toMatch(/maximum|limit|too many/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE MEASUREMENT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('DELETE /projects/:projectId/measurements/:id', () => {
    let measurementToDelete;

    beforeAll(async () => {
      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.measurement({ name: 'To Delete' }));
      measurementToDelete = res.body.id;
    });

    it('should delete a measurement', async () => {
      const res = await api
        .delete(`/projects/${projectId}/measurements/${measurementToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for deleted measurement', async () => {
      await api
        .get(`/projects/${projectId}/measurements/${measurementToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GEOMETRY VALIDATION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Geometry Validation', () => {
    it('should accept valid Point geometry', async () => {
      const measurement = factories.measurement({
        type: 'count',
        geometry: { type: 'Point', coordinates: [10, 20] },
      });

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.geometry.type).toBe('Point');
    });

    it('should accept valid LineString geometry', async () => {
      const measurement = factories.measurement({
        type: 'length',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 0], [10, 10]],
        },
      });

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.geometry.type).toBe('LineString');
    });

    it('should accept valid Polygon with holes', async () => {
      const measurement = factories.measurement({
        type: 'area',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]], // Outer ring
            [[20, 20], [20, 80], [80, 80], [80, 20], [20, 20]], // Hole
          ],
        },
      });

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(201);

      expect(res.body.geometry.coordinates.length).toBe(2);
    });

    it('should reject self-intersecting polygon', async () => {
      const measurement = factories.measurement({
        type: 'area',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [100, 100], [100, 0], [0, 100], [0, 0]]], // Self-intersecting
        },
      });

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(400);

      expect(res.body.error).toMatch(/geometry|invalid|self.*intersect/i);
    });

    it('should reject invalid coordinate values', async () => {
      const measurement = factories.measurement({
        type: 'count',
        geometry: {
          type: 'Point',
          coordinates: ['invalid', 'coords'],
        },
      });

      const res = await api
        .post(`/projects/${projectId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(measurement)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });
});
