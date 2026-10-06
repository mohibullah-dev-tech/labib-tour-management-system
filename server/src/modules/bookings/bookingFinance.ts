import { DEFAULT_MINIMUM_ADVANCE_PERCENT } from '@/constants/index.js';

export interface BookingFinance {
  unitPrice: number;
  quantity: number;
  amountReceived: number;
  discount?: number;
  minimumAdvancePercent?: number;
}

export function calculateBookingFinance(input: BookingFinance) {
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0)
    throw new RangeError('Unit price must be nonnegative');
  if (!Number.isInteger(input.quantity) || input.quantity < 1)
    throw new RangeError('Quantity must be a positive integer');
  if (!Number.isFinite(input.amountReceived) || input.amountReceived < 0)
    throw new RangeError('Received amount must be nonnegative');

  const subtotal = input.unitPrice * input.quantity;
  const discount = input.discount ?? 0;
  const minimumAdvancePercent = input.minimumAdvancePercent ?? DEFAULT_MINIMUM_ADVANCE_PERCENT;
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal)
    throw new RangeError('Discount must be within the subtotal');
  if (
    !Number.isFinite(minimumAdvancePercent) ||
    minimumAdvancePercent < 0 ||
    minimumAdvancePercent > 100
  ) {
    throw new RangeError('Minimum advance percent must be between 0 and 100');
  }
  const totalAmount = subtotal - discount;
  return {
    packagePrice: input.unitPrice,
    subtotal,
    discount,
    totalAmount,
    minimumAdvancePercent,
    minimumAdvance: Math.ceil((totalAmount * minimumAdvancePercent) / 100),
    receivedAmount: input.amountReceived,
    dueAmount: Math.max(0, totalAmount - input.amountReceived),
  };
}
