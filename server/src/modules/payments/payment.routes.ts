import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { SSLCommerzService } from './sslcommerz.service.js';
import { authenticateOptional } from '@/middlewares/authenticate.js';

const envelope = (data: unknown) => ({ success: true, data });

const router = Router();

const initiateSchema = z.object({
  bookingId: z.string().trim().min(1).max(100),
  amount: z.number().positive().optional(),
  paymentType: z.enum(['advance', 'full']).optional(),
  cusName: z.string().trim().max(120).optional(),
  cusPhone: z.string().trim().max(24).optional(),
  cusEmail: z.string().email().optional(),
});

/**
 * Public/Guest Endpoint: Initiate SSLCommerz checkout session.
 */
router.post(
  '/sslcommerz/initiate',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const input = initiateSchema.parse(req.body);
    const result = await SSLCommerzService.initiatePayment(input);
    res.json(envelope(result));
  }),
);

/**
 * SSLCommerz Gateway Callback: Success (POST from SSLCommerz server).
 */
router.post(
  '/sslcommerz/success',
  asyncHandler(async (req, res) => {
    const redirectUrl = await SSLCommerzService.processPaymentSuccess(req.body);
    res.redirect(302, redirectUrl);
  }),
);

/**
 * SSLCommerz Gateway Callback: Fail.
 */
router.post(
  '/sslcommerz/fail',
  asyncHandler(async (req, res) => {
    const redirectUrl = SSLCommerzService.processPaymentFailure(req.body, 'failed');
    res.redirect(302, redirectUrl);
  }),
);

/**
 * SSLCommerz Gateway Callback: Cancel.
 */
router.post(
  '/sslcommerz/cancel',
  asyncHandler(async (req, res) => {
    const redirectUrl = SSLCommerzService.processPaymentFailure(req.body, 'cancelled');
    res.redirect(302, redirectUrl);
  }),
);

/**
 * SSLCommerz IPN (Instant Payment Notification) listener.
 */
router.post(
  '/sslcommerz/ipn',
  asyncHandler(async (req, res) => {
    await SSLCommerzService.processPaymentSuccess(req.body);
    res.status(200).send('IPN_PROCESSED');
  }),
);

/**
 * Development Simulation: Instant direct completion for sandbox testing without SSLCommerz credentials.
 */
router.post(
  '/sslcommerz/simulate',
  asyncHandler(async (req, res) => {
    const { bookingCode, amount, method = 'bKash', tranId } = req.body;
    const redirectUrl = await SSLCommerzService.processPaymentSuccess({
      tran_id: tranId || `SIM-${Date.now()}`,
      value_b: bookingCode,
      amount: String(amount),
      card_type: method,
      bank_tran_id: `SIM-BANK-${Date.now()}`,
    });
    res.json(envelope({ success: true, redirectUrl }));
  }),
);

export default router;
