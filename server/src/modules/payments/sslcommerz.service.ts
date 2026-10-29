import { Types } from 'mongoose';
import { Booking, Payment, TourEvent, TourTemplate, User } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import { emailService } from '@/services/email.service.js';

export interface InitiatePaymentParams {
  bookingId: string;
  amount?: number;
  paymentType?: 'advance' | 'full';
  cusName?: string;
  cusPhone?: string;
  cusEmail?: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  gatewayUrl: string;
  tranId: string;
  amount: number;
  currency: string;
  isSimulation?: boolean;
}

export class SSLCommerzService {
  private static getGatewayUrl(): string {
    return env.SSLCOMMERZ_IS_LIVE
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
  }

  /**
   * Initiate SSLCommerz checkout session for a given booking.
   */
  static async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const { bookingId, paymentType = 'advance' } = params;

    // 1. Locate booking by ObjectId or unique bookingCode
    const isObjectId = Types.ObjectId.isValid(bookingId) && /^[0-9a-fA-F]{24}$/.test(bookingId);
    const bookingQuery = isObjectId ? { _id: bookingId } : { bookingCode: bookingId.toUpperCase() };

    const booking = await Booking.findOne(bookingQuery).populate('tourTemplateId eventId').lean();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw ApiError.conflict('Cannot initiate payment for a cancelled booking');
    }

    if (booking.paymentStatus === 'paid' || booking.dueAmount <= 0) {
      throw ApiError.conflict('This booking is already paid in full');
    }

    // 2. Determine payable amount
    let targetAmount = booking.dueAmount;
    if (paymentType === 'advance' && booking.receivedAmount < booking.minimumAdvance) {
      targetAmount = Math.min(booking.dueAmount, booking.minimumAdvance - booking.receivedAmount);
    }
    if (params.amount && params.amount > 0 && params.amount <= booking.dueAmount) {
      targetAmount = params.amount;
    }

    const tranId = `LTMS-${booking.bookingCode}-${Date.now().toString(36).toUpperCase()}`;
    const primaryGuest = booking.guestDetails?.[0];
    const customer =
      (booking.customerId as unknown as { name?: string; phone?: string; email?: string }) || {};

    const cusName = params.cusName || primaryGuest?.name || customer.name || 'Traveler';
    const cusPhone = params.cusPhone || primaryGuest?.phone || customer.phone || '01700000000';
    const cusEmail =
      params.cusEmail || primaryGuest?.email || customer.email || 'guest@labibtours.com';

    // Construct server backend callback URLs (Express server port 5000)
    const backendBase = env.CLIENT_URL.replace(/:\d+$/, `:${env.PORT || 5000}`);
    const successUrl = `${backendBase}/api/v1/payments/sslcommerz/success`;
    const failUrl = `${backendBase}/api/v1/payments/sslcommerz/fail`;
    const cancelUrl = `${backendBase}/api/v1/payments/sslcommerz/cancel`;
    const ipnUrl = `${backendBase}/api/v1/payments/sslcommerz/ipn`;

    const payload = new URLSearchParams({
      store_id: env.SSLCOMMERZ_STORE_ID,
      store_passwd: env.SSLCOMMERZ_STORE_PASS,
      total_amount: targetAmount.toFixed(2),
      currency: booking.currency || 'BDT',
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      shipping_method: 'NO',
      product_name: (booking.tourTemplateId as any)?.title || 'Tour Booking',
      product_category: 'Travel & Tourism',
      product_profile: 'travel-vertical',
      cus_name: cusName,
      cus_email: cusEmail,
      cus_add1: primaryGuest?.address || 'Dhaka, Bangladesh',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: cusPhone,
      value_a: booking._id.toString(),
      value_b: booking.bookingCode,
      value_c: paymentType,
      value_d: targetAmount.toString(),
    });

    try {
      logger.info('Initiating SSLCommerz payment session', {
        tranId,
        bookingCode: booking.bookingCode,
        amount: targetAmount,
      });

      const response = await fetch(this.getGatewayUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      const data = (await response.json()) as any;

      if (data?.status === 'SUCCESS' && data?.GatewayPageURL) {
        return {
          success: true,
          gatewayUrl: data.GatewayPageURL,
          tranId,
          amount: targetAmount,
          currency: booking.currency || 'BDT',
        };
      }

      logger.warn('SSLCommerz gateway returned non-success, using sandbox simulation fallback', {
        status: data?.status,
        failedreason: data?.failedreason,
      });
    } catch (err) {
      logger.warn('SSLCommerz network initiation exception, using sandbox simulation fallback', {
        error: err,
      });
    }

    // Interactive fallback for sandbox testing / offline development
    const simulationUrl = `${env.CLIENT_URL}/booking/payment-simulation?bookingCode=${booking.bookingCode}&tranId=${tranId}&amount=${targetAmount}`;
    return {
      success: true,
      gatewayUrl: simulationUrl,
      tranId,
      amount: targetAmount,
      currency: booking.currency || 'BDT',
      isSimulation: true,
    };
  }

  /**
   * Process successful payment webhook/POST from SSLCommerz.
   */
  static async processPaymentSuccess(body: Record<string, any>): Promise<string> {
    const tranId = body.tran_id;
    const bookingCode = body.value_b || body.value_a;
    const paidAmount = Number.parseFloat(
      body.amount || body.currency_amount || body.value_d || '0',
    );
    const paymentMethod = body.card_type || body.card_issuer || 'sslcommerz';
    const bankTranId = body.bank_tran_id || body.val_id || tranId;

    logger.info('Processing SSLCommerz payment success callback', {
      tranId,
      bookingCode,
      amount: paidAmount,
      method: paymentMethod,
    });

    // Locate booking
    const booking = await Booking.findOne({
      $or: [
        { bookingCode: bookingCode?.toUpperCase() },
        ...(Types.ObjectId.isValid(bookingCode) ? [{ _id: bookingCode }] : []),
      ],
    });

    if (!booking) {
      logger.error('Booking not found for payment callback', { bookingCode, tranId });
      return `${env.CLIENT_URL}/booking/payment-result?status=failed&error=booking_not_found`;
    }

    // Check idempotency (prevent duplicate payment execution)
    const existingPayment = await Payment.findOne({ transactionId: bankTranId });
    if (!existingPayment && paidAmount > 0) {
      // Find system / guest user for receivedBy
      const systemUser = await User.findOne({ role: 'admin' }).select('_id');

      await Payment.create({
        bookingId: booking._id,
        amount: paidAmount,
        method:
          paymentMethod.toLowerCase().includes('bkash') ||
          paymentMethod.toLowerCase().includes('nagad') ||
          paymentMethod.toLowerCase().includes('rocket')
            ? 'mobile_banking'
            : 'bank',
        transactionId: bankTranId,
        receivedBy: systemUser?._id,
        note: `SSLCommerz Online Payment: ${paymentMethod} (${tranId})`,
        status: 'completed',
      });

      booking.receivedAmount += paidAmount;
      booking.dueAmount = Math.max(0, booking.totalAmount - booking.receivedAmount);
      booking.paymentStatus = booking.dueAmount === 0 ? 'paid' : 'partial';

      if (booking.receivedAmount >= booking.minimumAdvance && booking.bookingStatus === 'pending') {
        booking.bookingStatus = 'confirmed';
      }

      await booking.save();

      // Dispatch booking confirmation email asynchronously
      try {
        const customer = await User.findById(booking.customerId).select('name email');
        const tourTemplate = await TourTemplate.findById(booking.tourTemplateId).select('title');
        const event = await TourEvent.findById(booking.eventId).select('startDate');
        const recipientEmail = customer?.email || booking.guestDetails?.[0]?.email;
        const recipientName = customer?.name || booking.guestDetails?.[0]?.name || 'Traveler';

        if (recipientEmail) {
          const departureStr = event?.startDate
            ? new Date(event.startDate).toLocaleDateString('bn-BD', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'শীঘ্রই ঘোষণা করা হবে';

          emailService
            .sendBookingConfirmationEmail(recipientEmail, recipientName, {
              bookingReference: booking.bookingCode,
              tourTitle: tourTemplate?.title || 'স্পেশাল গ্রুপ ট্যুর',
              departureDate: departureStr,
              seats: booking.seatNumbers,
              totalAmount: booking.totalAmount,
              paidAmount: booking.receivedAmount,
              dueAmount: booking.dueAmount,
              ticketUrl: `${env.CLIENT_URL}/booking/tickets/${booking.bookingCode}`,
            })
            .catch(() => {});
        }
      } catch (emailErr) {
        logger.warn('Failed to dispatch booking confirmation email', { error: emailErr });
      }
    }

    return `${env.CLIENT_URL}/booking/payment-result?status=success&bookingCode=${booking.bookingCode}&tranId=${encodeURIComponent(tranId)}&amount=${paidAmount}`;
  }

  /**
   * Process fail or cancel callback.
   */
  static processPaymentFailure(body: Record<string, any>, status: 'failed' | 'cancelled'): string {
    const bookingCode = body.value_b || body.value_a || '';
    const tranId = body.tran_id || '';
    return `${env.CLIENT_URL}/booking/payment-result?status=${status}&bookingCode=${encodeURIComponent(bookingCode)}&tranId=${encodeURIComponent(tranId)}`;
  }
}
