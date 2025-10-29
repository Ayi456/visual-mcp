import express from 'express';
import { UserController } from '../controllers/UserController.js';

export function setupUserRoutes(app: express.Application, userController: UserController) {
  app.get('/api/users/:userId/quota', userController.getQuota);

  app.get('/api/users/:userId/settings', userController.getSettings);

  app.post('/api/users/:userId/settings', userController.updateSettings);
}
