/**
 * JOCstudio Hero Strategy Tests
 * Tests for the "First Win" celebration flow and ongoing engagement
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { config, factories, waitFor } from '../api-tests/setup.js';

const api = request(config.baseUrl);

describe('Hero Strategy', () => {
  let authToken;
  let userId;
  let projectId;

  beforeAll(async () => {
    // Create a new user for Hero testing
    const user = factories.user({
      email: `hero-test-${Date.now()}@test.jocstudio.com`,
    });
    const res = await api.post('/auth/register').send(user);
    authToken = res.body.token;
    userId = res.body.user.id;

    // Create a project
    const project = await api
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(factories.project({ name: 'Hero Test Project' }));
    projectId = project.body.id;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FIRST WIN TRIGGER TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('First Win Trigger', () => {
    it('should trigger Hero sequence when project marked as won', async () => {
      // Mark project as won
      const res = await api
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'won', contractValue: 50000 })
        .expect(200);

      expect(res.body.status).toBe('won');
      expect(res.body).toHaveProperty('heroTriggered');
      expect(res.body.heroTriggered).toBe(true);
    });

    it('should record first win timestamp', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.user).toHaveProperty('firstWinAt');
      expect(res.body.user.firstWinAt).not.toBeNull();
    });

    it('should not re-trigger Hero for subsequent wins', async () => {
      // Create and win another project
      const project2 = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.project({ name: 'Second Win Project' }));

      const res = await api
        .patch(`/projects/${project2.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'won', contractValue: 75000 })
        .expect(200);

      // Should still succeed but not trigger Hero again
      expect(res.body.status).toBe('won');
      expect(res.body.heroTriggered).toBeFalsy(); // Only first win triggers
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMAIL TRIGGER TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('First Win Email', () => {
    it('should queue celebration email on first win', async () => {
      // Check email queue (test endpoint)
      const res = await api
        .get('/api/test/email-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const heroEmail = res.body.emails.find(
        e => e.type === 'hero_first_win' && e.userId === userId
      );

      expect(heroEmail).toBeDefined();
      expect(heroEmail.status).toBe('queued');
    });

    it('should include personalized content in email', async () => {
      const res = await api
        .get(`/api/test/email-preview/hero_first_win?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.subject).toMatch(/congratulations|first win/i);
      expect(res.body.body).toContain('Hero Test Project');
      expect(res.body.body).toContain('$50,000'); // Contract value
    });

    it('should send email within configured delay', async () => {
      // In test environment, emails should be sent immediately or with short delay
      const res = await api
        .get('/api/test/email-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const heroEmail = res.body.emails.find(
        e => e.type === 'hero_first_win' && e.userId === userId
      );

      // Check scheduled time is within expected range
      const scheduledAt = new Date(heroEmail.scheduledAt);
      const now = new Date();
      const diffMinutes = (scheduledAt - now) / (1000 * 60);

      expect(diffMinutes).toBeLessThanOrEqual(60); // Within 1 hour
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DISCORD WEBHOOK TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Discord Webhook', () => {
    it('should send Discord notification on first win', async () => {
      // Check webhook queue
      const res = await api
        .get('/api/test/webhook-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const discordWebhook = res.body.webhooks.find(
        w => w.type === 'discord' && w.event === 'hero_first_win'
      );

      expect(discordWebhook).toBeDefined();
    });

    it('should include correct embed structure', async () => {
      const res = await api
        .get(`/api/test/webhook-preview/discord/hero_first_win?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('embeds');
      expect(res.body.embeds[0]).toHaveProperty('title');
      expect(res.body.embeds[0]).toHaveProperty('color');
      expect(res.body.embeds[0].title).toMatch(/new hero|first win/i);
    });

    it('should not expose sensitive user data in webhook', async () => {
      const res = await api
        .get(`/api/test/webhook-preview/discord/hero_first_win?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const webhookString = JSON.stringify(res.body);
      
      // Should not contain sensitive data
      expect(webhookString).not.toMatch(/password/i);
      expect(webhookString).not.toMatch(/credit.*card/i);
      expect(webhookString).not.toMatch(/ssn/i);
      // Should not contain full email
      expect(webhookString).not.toContain('@test.jocstudio.com');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BADGE ASSIGNMENT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Badge Assignment', () => {
    it('should assign "First Win" badge to user', async () => {
      const res = await api
        .get('/users/me/badges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const firstWinBadge = res.body.badges.find(
        b => b.type === 'first_win' || b.name.toLowerCase().includes('first win')
      );

      expect(firstWinBadge).toBeDefined();
      expect(firstWinBadge.earnedAt).toBeDefined();
    });

    it('should display badge on user profile', async () => {
      const res = await api
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.user.badges).toBeDefined();
      expect(res.body.user.badges.length).toBeGreaterThan(0);
    });

    it('should not duplicate badges', async () => {
      // Win another project
      const project = await api
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factories.project());

      await api
        .patch(`/projects/${project.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'won' });

      // Check badges
      const res = await api
        .get('/users/me/badges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const firstWinBadges = res.body.badges.filter(
        b => b.type === 'first_win'
      );

      expect(firstWinBadges.length).toBe(1); // Only one First Win badge
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROGRESS TRACKING TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Progress Tracking', () => {
    it('should track total wins', async () => {
      const res = await api
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.stats).toHaveProperty('totalWins');
      expect(res.body.stats.totalWins).toBeGreaterThan(0);
    });

    it('should track total contract value', async () => {
      const res = await api
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.stats).toHaveProperty('totalContractValue');
      expect(res.body.stats.totalContractValue).toBeGreaterThanOrEqual(50000);
    });

    it('should track win rate', async () => {
      const res = await api
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.stats).toHaveProperty('winRate');
      expect(res.body.stats.winRate).toBeGreaterThanOrEqual(0);
      expect(res.body.stats.winRate).toBeLessThanOrEqual(100);
    });

    it('should unlock milestone badges', async () => {
      // Create and win multiple projects to trigger milestones
      for (let i = 0; i < 4; i++) {
        const project = await api
          .post('/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send(factories.project({ name: `Milestone Project ${i}` }));

        await api
          .patch(`/projects/${project.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'won', contractValue: 10000 });
      }

      const res = await api
        .get('/users/me/badges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should have milestone badge (e.g., "5 Wins")
      const milestoneBadge = res.body.badges.find(
        b => b.type === 'milestone_5_wins' || b.name.includes('5')
      );

      expect(milestoneBadge).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CASE STUDY WORKFLOW TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Case Study Workflow', () => {
    it('should prompt for case study after first win', async () => {
      const res = await api
        .get('/users/me/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const caseStudyPrompt = res.body.prompts.find(
        p => p.type === 'case_study_request'
      );

      expect(caseStudyPrompt).toBeDefined();
      expect(caseStudyPrompt.projectId).toBe(projectId);
    });

    it('should allow submitting case study', async () => {
      const caseStudy = {
        projectId,
        challenge: 'Client needed accurate takeoffs quickly',
        solution: 'Used JOCstudio to automate measurements',
        results: 'Saved 5 hours per project',
        testimonial: 'JOCstudio transformed our estimating process',
        canShare: true,
      };

      const res = await api
        .post('/case-studies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(caseStudy)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('pending_review');
    });

    it('should track case study submission', async () => {
      const res = await api
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.stats).toHaveProperty('caseStudiesSubmitted');
      expect(res.body.stats.caseStudiesSubmitted).toBeGreaterThan(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HERO CELEBRATION UI TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Hero Celebration UI Data', () => {
    it('should return celebration data for UI', async () => {
      const res = await api
        .get('/hero/celebration')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('showCelebration');
      expect(res.body).toHaveProperty('projectName');
      expect(res.body).toHaveProperty('contractValue');
      expect(res.body).toHaveProperty('badges');
    });

    it('should mark celebration as seen', async () => {
      await api
        .post('/hero/celebration/seen')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Subsequent calls should not show celebration
      const res = await api
        .get('/hero/celebration')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.showCelebration).toBe(false);
    });
  });
});
