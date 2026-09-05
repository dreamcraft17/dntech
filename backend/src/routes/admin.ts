import { Router } from 'express';
import { asyncHandler, successResponse, paginatedResponse, param } from '../utils/helpers';
import {
  authenticate,
  requireRole,
  requireWrite,
  AuthRequest,
} from '../middleware/auth';
import * as content from '../services/AdminContentService';
import * as directory from '../services/AdminDirectoryService';
import * as media from '../services/AdminMediaService';
import * as settings from '../services/AdminSettingsService';
import * as users from '../services/AdminUserService';
import * as analytics from '../services/AdminAnalyticsService';
import * as leads from '../services/LeadService';

const router = Router();
router.use(authenticate);

// --- Services ---
router.get('/services', asyncHandler(async (req, res) => {
  successResponse(res, await content.listServices(req.query as Record<string, unknown>));
}));

router.post('/services', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  const service = await content.createService(req.body, req.user!.id, req.ip);
  successResponse(res, service, 201);
}));

router.patch('/services/:id', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  const service = await content.updateService(param(req.params.id), req.body, req.user!.id, req.ip);
  successResponse(res, service);
}));

router.delete('/services/:id', requireWrite('services'), asyncHandler(async (req: AuthRequest, res) => {
  await content.deleteService(param(req.params.id), req.user!.id, req.ip);
  successResponse(res, { deleted: true });
}));

router.post('/services/reorder', requireWrite('services'), asyncHandler(async (req, res) => {
  await content.reorderServices(req.body);
  successResponse(res, { reordered: true });
}));

// --- Products ---
router.get('/products', asyncHandler(async (req, res) => {
  successResponse(res, await content.listProducts(req.query as Record<string, unknown>));
}));

router.post('/products', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  const product = await content.createProduct(req.body, req.user!.id, req.ip);
  successResponse(res, product, 201);
}));

router.patch('/products/:id', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  const product = await content.updateProduct(param(req.params.id), req.body, req.user!.id, req.ip);
  successResponse(res, product);
}));

router.delete('/products/:id', requireWrite('products'), asyncHandler(async (req: AuthRequest, res) => {
  await content.deleteProduct(param(req.params.id), req.user!.id, req.ip);
  successResponse(res, { deleted: true });
}));

router.post('/products/reorder', requireWrite('products'), asyncHandler(async (req, res) => {
  await content.reorderProducts(req.body);
  successResponse(res, { reordered: true });
}));

// --- Portfolio ---
router.get('/portfolio', asyncHandler(async (req, res) => {
  successResponse(res, await content.listPortfolioItems(req.query as Record<string, unknown>));
}));

router.post('/portfolio', requireWrite('portfolio'), asyncHandler(async (req: AuthRequest, res) => {
  const item = await content.createPortfolioItem(req.body, req.user!.id, req.ip);
  successResponse(res, item, 201);
}));

router.patch('/portfolio/:id', requireWrite('portfolio'), asyncHandler(async (req: AuthRequest, res) => {
  const item = await content.updatePortfolioItem(param(req.params.id), req.body, req.user!.id, req.ip);
  successResponse(res, item);
}));

router.delete('/portfolio/:id', requireWrite('portfolio'), asyncHandler(async (req, res) => {
  await content.deletePortfolioItem(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Blog ---
router.get('/blog', asyncHandler(async (req, res) => {
  successResponse(res, await content.listBlogPosts(req.query as Record<string, unknown>));
}));

router.post('/blog', requireWrite('blog'), asyncHandler(async (req: AuthRequest, res) => {
  const post = await content.createBlogPost(req.body, req.user!.id, req.ip);
  successResponse(res, post, 201);
}));

router.patch('/blog/:id', requireWrite('blog'), asyncHandler(async (req, res) => {
  const post = await content.updateBlogPost(param(req.params.id), req.body);
  successResponse(res, post);
}));

router.post('/blog/:id/publish', requireWrite('blog'), asyncHandler(async (req, res) => {
  const post = await content.publishBlogPost(param(req.params.id));
  successResponse(res, post);
}));

router.delete('/blog/:id', requireWrite('blog'), asyncHandler(async (req, res) => {
  await content.deleteBlogPost(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Leads ---
router.get('/leads', asyncHandler(async (req, res) => {
  const { leads: items, page, pageSize, total } = await leads.listLeadsAdmin(req.query as Record<string, unknown>);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/leads/:id', asyncHandler(async (req, res) => {
  successResponse(res, await leads.getLeadByIdAdmin(param(req.params.id)));
}));

router.patch('/leads/:id/status', requireWrite('leads'), asyncHandler(async (req, res) => {
  successResponse(res, await leads.updateLeadStatus(param(req.params.id), req.body));
}));

router.patch('/leads/:id/assign', requireWrite('leads'), asyncHandler(async (req, res) => {
  successResponse(res, await leads.assignLead(param(req.params.id), req.body));
}));

router.post('/leads/:id/notes', requireWrite('leads'), asyncHandler(async (req, res) => {
  successResponse(res, await leads.addLeadNote(param(req.params.id), req.body));
}));

router.post('/leads/export', asyncHandler(async (req, res) => {
  const csv = await leads.exportLeadsCsv(req.body);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
  res.send(csv);
}));

router.delete('/leads/:id', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  await leads.deleteLeadAdmin(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Team ---
router.get('/team', asyncHandler(async (_req, res) => {
  successResponse(res, await directory.listTeamMembers());
}));

router.post('/team', requireWrite('team'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.createTeamMember(req.body), 201);
}));

router.patch('/team/:id', requireWrite('team'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.updateTeamMember(param(req.params.id), req.body));
}));

router.delete('/team/:id', requireWrite('team'), asyncHandler(async (req, res) => {
  await directory.deleteTeamMember(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Testimonials ---
router.get('/testimonials', asyncHandler(async (_req, res) => {
  successResponse(res, await directory.listTestimonials());
}));

router.post('/testimonials', requireWrite('testimonials'), asyncHandler(async (req: AuthRequest, res) => {
  const item = await directory.createTestimonial(req.body, req.user!.id);
  successResponse(res, item, 201);
}));

router.patch('/testimonials/:id', requireWrite('testimonials'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.updateTestimonial(param(req.params.id), req.body));
}));

router.delete('/testimonials/:id', requireWrite('testimonials'), asyncHandler(async (req, res) => {
  await directory.deleteTestimonial(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- FAQs ---
router.get('/faqs', asyncHandler(async (_req, res) => {
  successResponse(res, await directory.listFaqs());
}));

router.post('/faqs', requireWrite('faqs'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.createFaq(req.body), 201);
}));

router.patch('/faqs/:id', requireWrite('faqs'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.updateFaq(param(req.params.id), req.body));
}));

router.delete('/faqs/:id', requireWrite('faqs'), asyncHandler(async (req, res) => {
  await directory.deleteFaq(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Careers ---
router.get('/careers', asyncHandler(async (_req, res) => {
  successResponse(res, await directory.listCareers());
}));

router.post('/careers', requireWrite('careers'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.createCareer(req.body), 201);
}));

router.patch('/careers/:id', requireWrite('careers'), asyncHandler(async (req, res) => {
  successResponse(res, await directory.updateCareer(param(req.params.id), req.body));
}));

router.delete('/careers/:id', requireWrite('careers'), asyncHandler(async (req, res) => {
  await directory.deleteCareer(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Media ---
router.get('/media', asyncHandler(async (req, res) => {
  const { media: items, page, pageSize, total } = await media.listMedia(req.query as Record<string, unknown>);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.post('/media', requireWrite('media'), media.upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  const created = await media.createMediaFromUpload(req.file, req.user!.id);
  successResponse(res, created, 201);
}));

router.patch('/media/:id', requireWrite('media'), asyncHandler(async (req, res) => {
  successResponse(res, await media.updateMedia(param(req.params.id), req.body));
}));

router.delete('/media/:id', requireWrite('media'), asyncHandler(async (req, res) => {
  await media.deleteMedia(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Settings ---
router.get('/settings', asyncHandler(async (_req, res) => {
  successResponse(res, await settings.getSettings());
}));

router.patch('/settings', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req: AuthRequest, res) => {
  const updated = await settings.updateSettings(req.body, req.user!.id, req.ip);
  successResponse(res, updated);
}));

// --- Users ---
router.get('/users', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  successResponse(res, await users.listUsers(req.query as Record<string, unknown>));
}));

router.post('/users', requireRole('SuperAdmin'), asyncHandler(async (req: AuthRequest, res) => {
  const created = await users.createUser(req.body, req.user!.id);
  successResponse(res, created, 201);
}));

router.patch('/users/:id', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  successResponse(res, await users.updateUser(param(req.params.id), req.body));
}));

router.delete('/users/:id', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  await users.deleteUser(param(req.params.id));
  successResponse(res, { deleted: true });
}));

// --- Analytics ---
router.get('/analytics/dashboard', asyncHandler(async (_req, res) => {
  successResponse(res, await analytics.getDashboardMetrics());
}));

router.get('/analytics/overview', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  successResponse(res, await analytics.getAnalyticsOverview(days));
}));

router.get('/analytics/traffic', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  successResponse(res, await analytics.getAnalyticsTraffic(days));
}));

router.get('/analytics/conversions', asyncHandler(async (req, res) => {
  const days = parseInt(String(req.query.days || '30'), 10);
  successResponse(res, await analytics.getAnalyticsConversions(days));
}));

// --- Activity / Logs ---
router.get('/newsletter-subscribers', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { items, page, pageSize, total } = await analytics.listNewsletterSubscribers(req.query as Record<string, unknown>);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/quiz-submissions', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { items, page, pageSize, total } = await analytics.listQuizSubmissions(req.query as Record<string, unknown>);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/email-logs', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (req, res) => {
  const { items, page, pageSize, total } = await analytics.listEmailLogs(req.query as Record<string, unknown>);
  paginatedResponse(res, items, { page, pageSize, total });
}));

router.get('/email-stats', requireRole('SuperAdmin', 'ContentManager'), asyncHandler(async (_req, res) => {
  successResponse(res, await analytics.getEmailStats());
}));

router.get('/activity-logs', requireRole('SuperAdmin'), asyncHandler(async (req, res) => {
  const { logs, page, pageSize, total } = await analytics.listActivityLogs(req.query as Record<string, unknown>);
  paginatedResponse(res, logs, { page, pageSize, total });
}));

export default router;
