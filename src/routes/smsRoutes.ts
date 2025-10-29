import express from 'express';
import { SmsController } from '../controllers/SmsController.js';

export function setupSmsRoutes(app: express.Application, smsController: SmsController) {
  app.post('/api/sms/send-code', smsController.sendCode);

  app.post('/api/sms/verify-code', smsController.verifyCode);
}
