import express from 'express';
import { QuotaController } from '../controllers/QuotaController.js';


export function setupQuotaRoutes(app: express.Application, quotaController: QuotaController) {
  app.get('/api/quota/stats', quotaController.getStats);

  app.post('/api/quota/reset/daily', quotaController.resetDaily);

  app.post('/api/quota/reset/monthly', quotaController.resetMonthly);
}
