import express from 'express';
import { AuthController } from '../controllers/AuthController.js';

export function setupAuthRoutes(app: express.Application, authController: AuthController) {
  app.post('/api/auth/register', authController.register);

  app.post('/api/auth/login', authController.login);

  app.post('/api/auth/change-password', authController.changePassword);

  app.post('/api/auth/access-key/rotate', authController.rotateAccessKey);

  app.post('/api/auth/forget/send-code', authController.sendPasswordResetCode);

  app.post('/api/auth/forget/verify-code', authController.verifyPasswordResetCode);

  app.post('/api/auth/forget/reset', authController.resetPassword);
}
