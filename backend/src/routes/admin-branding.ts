import { Router } from 'express';
import { successResponse, asyncHandler, param } from '../utils/helpers';
import { authenticate, requireRole } from '../middleware/auth';
import * as branding from '../services/AdminBrandingService';

const router = Router();
router.use(authenticate, requireRole('SuperAdmin', 'ContentManager'));

router.get('/content', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.getBrandContent());
}));

router.put('/content', asyncHandler(async (req, res) => {
  successResponse(res, await branding.upsertBrandContent(req.body));
}));

router.get('/values', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.listCoreValues());
}));

router.post('/values', asyncHandler(async (req, res) => {
  successResponse(res, await branding.createCoreValue(req.body), 201);
}));

router.put('/values/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateCoreValue(param(req.params.id), req.body));
}));
router.patch('/values/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateCoreValue(param(req.params.id), req.body));
}));

router.delete('/values/:id', asyncHandler(async (req, res) => {
  await branding.deleteCoreValue(param(req.params.id));
  successResponse(res, { deleted: true });
}));

router.get('/advantages', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.listAdvantages());
}));

router.post('/advantages', asyncHandler(async (req, res) => {
  successResponse(res, await branding.createAdvantage(req.body), 201);
}));

router.put('/advantages/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateAdvantage(param(req.params.id), req.body));
}));
router.patch('/advantages/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateAdvantage(param(req.params.id), req.body));
}));

router.delete('/advantages/:id', asyncHandler(async (req, res) => {
  await branding.deleteAdvantage(param(req.params.id));
  successResponse(res, { deleted: true });
}));

router.get('/team', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.listBrandTeam());
}));

router.post('/team', asyncHandler(async (req, res) => {
  successResponse(res, await branding.createBrandTeamMember(req.body), 201);
}));

router.put('/team/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateBrandTeamMember(param(req.params.id), req.body));
}));
router.patch('/team/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateBrandTeamMember(param(req.params.id), req.body));
}));

router.delete('/team/:id', asyncHandler(async (req, res) => {
  await branding.deleteBrandTeamMember(param(req.params.id));
  successResponse(res, { deleted: true });
}));

router.get('/testimonials', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.listBrandTestimonials());
}));

router.post('/testimonials', asyncHandler(async (req, res) => {
  successResponse(res, await branding.createBrandTestimonial(req.body), 201);
}));

router.put('/testimonials/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateBrandTestimonial(param(req.params.id), req.body));
}));
router.patch('/testimonials/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateBrandTestimonial(param(req.params.id), req.body));
}));

router.delete('/testimonials/:id', asyncHandler(async (req, res) => {
  await branding.deleteBrandTestimonial(param(req.params.id));
  successResponse(res, { deleted: true });
}));

router.get('/stats', asyncHandler(async (_req, res) => {
  successResponse(res, await branding.listStats());
}));

router.post('/stats', asyncHandler(async (req, res) => {
  successResponse(res, await branding.createStat(req.body), 201);
}));

router.put('/stats/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateStat(param(req.params.id), req.body));
}));
router.patch('/stats/:id', asyncHandler(async (req, res) => {
  successResponse(res, await branding.updateStat(param(req.params.id), req.body));
}));

router.delete('/stats/:id', asyncHandler(async (req, res) => {
  await branding.deleteStat(param(req.params.id));
  successResponse(res, { deleted: true });
}));

export default router;
