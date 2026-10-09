import PDFDocument from 'pdfkit';
import { Types } from 'mongoose';
import { Booking, TourEvent, TourTemplate, Bus, User, HostProfile } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';

export interface GeneratePdfOptions {
  bookingId: string;
  documentType: 'ticket' | 'receipt';
  user: {
    id: string;
    role: string;
  };
}

export interface GeneratedPdfResult {
  doc: InstanceType<typeof PDFDocument>;
  filename: string;
  bookingCode: string;
}

const COMPANY_INFO = {
  name: 'Labib Tour & Travel Group',
  tagline: 'Premium Curated Group Tours & Travel Experiences',
  address: 'House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh',
  phone: '+880 1700-000000',
  email: 'support@labibtours.com',
  website: 'www.labibtours.com',
};

function formatBDT(amount: number): string {
  return `BDT ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'TBA';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generate official PDF booking ticket or receipt on demand.
 * Recalculates all financial figures from trusted backend data.
 * Validates strict RBAC and confirmation eligibility rules.
 */
export async function generateBookingPdf(options: GeneratePdfOptions): Promise<GeneratedPdfResult> {
  const { bookingId, documentType, user } = options;

  // 1. Fetch Booking by ObjectId or unique bookingCode
  const isObjectId = Types.ObjectId.isValid(bookingId) && /^[0-9a-fA-F]{24}$/.test(bookingId);
  const bookingQuery = isObjectId ? { _id: bookingId } : { bookingCode: bookingId.toUpperCase() };

  const booking = await Booking.findOne(bookingQuery).lean();
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // 2. Fetch associated Event, TourTemplate, Bus, Customer and Host
  const [event, template, customer] = await Promise.all([
    TourEvent.findById(booking.eventId).lean(),
    TourTemplate.findById(booking.tourTemplateId).lean(),
    User.findById(booking.customerId).select('name email phone').lean(),
  ]);

  if (!event || !template) {
    throw ApiError.notFound('Associated tour event or template not found');
  }

  const bus = await Bus.findById(event.busId).lean();
  const hostUser = event.hostId
    ? await User.findById(event.hostId).select('name phone email').lean()
    : null;

  // 3. Strict Authorization (RBAC)
  const isGuest = user.role === 'guest';
  const isHost = user.role === 'host';
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  if (isGuest) {
    if (String(booking.customerId) !== user.id) {
      throw ApiError.forbidden('You are not authorized to download this booking document');
    }
  } else if (isHost) {
    const isDirectHost = String(event.hostId) === user.id;
    let isProfileAssigned = false;
    if (!isDirectHost) {
      const profile = await HostProfile.findOne({ userId: user.id }).lean();
      isProfileAssigned = Boolean(
        profile?.assignedEventIds?.some((id) => id.toString() === event._id.toString()),
      );
    }
    if (!isDirectHost && !isProfileAssigned) {
      throw ApiError.forbidden('Hosts can only access documents for their assigned events');
    }
  } else if (!isAdmin) {
    throw ApiError.forbidden('Unauthorized role');
  }

  // 4. Booking Eligibility Check
  const isConfirmed =
    booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed';
  if (documentType === 'ticket') {
    if (!isConfirmed) {
      if (booking.bookingStatus === 'cancelled') {
        throw ApiError.conflict('Cannot generate a confirmed ticket for a cancelled booking.');
      }
      throw ApiError.conflict(
        'Booking is pending confirmation and is not eligible for a confirmed ticket. Please download the receipt instead or complete the required advance payment.',
      );
    }
  }

  // 5. Recalculate Financial Figures using trusted financial service
  const tierPrice =
    template.pricing?.packagePrices instanceof Map
      ? template.pricing.packagePrices.get(booking.bookingType)
      : (template.pricing?.packagePrices as Record<string, number> | undefined)?.[
          booking.bookingType
        ];
  const unitPrice =
    typeof tierPrice === 'number' && tierPrice > 0
      ? tierPrice
      : booking.packagePrice || template.pricing?.basePrice || 0;

  const trustedFinance = calculateBookingFinance({
    unitPrice,
    quantity: booking.personCount,
    amountReceived: booking.receivedAmount,
    discount: booking.discount,
    minimumAdvancePercent: booking.minimumAdvancePercent || template.minimumAdvancePercent,
  });

  // 6. Build PDF document using PDFKit
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `${documentType === 'ticket' ? 'Tour Ticket' : 'Booking Receipt'} - ${booking.bookingCode}`,
      Author: COMPANY_INFO.name,
      Subject: `${template.title} Booking Confirmation`,
      Keywords: 'Labib Tour, Ticket, Travel, Bangladesh',
    },
  });

  const pageWidth = 595.28; // A4 pt width
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt

  // --- BRAND HEADER ---
  // Top decorative header bar
  doc.rect(margin, 35, contentWidth, 6).fill('#0f766e'); // Deep Teal

  // Company Name & Subtitle
  doc
    .fillColor('#0f766e')
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(COMPANY_INFO.name.toUpperCase(), margin, 52);

  doc.fillColor('#64748b').font('Helvetica').fontSize(8.5).text(COMPANY_INFO.tagline, margin, 73);

  // Company Contact Details (right-aligned in header)
  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(7.5)
    .text(COMPANY_INFO.address, margin + 200, 52, { width: 315, align: 'right' })
    .text(`Tel: ${COMPANY_INFO.phone}  |  Email: ${COMPANY_INFO.email}`, margin + 200, 64, {
      width: 315,
      align: 'right',
    })
    .text(`Web: ${COMPANY_INFO.website}`, margin + 200, 76, { width: 315, align: 'right' });

  // Divider line
  doc
    .moveTo(margin, 92)
    .lineTo(margin + contentWidth, 92)
    .lineWidth(0.8)
    .strokeColor('#e2e8f0')
    .stroke();

  // --- DOCUMENT TITLE & KEY BADGES ---
  const docTitle =
    documentType === 'ticket'
      ? 'OFFICIAL TOUR TICKET & BOARDING PASS'
      : 'BOOKING CONFIRMATION & PAYMENT RECEIPT';

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text(docTitle, margin, 105);

  // Booking Code box
  const boxTop = 125;
  doc.roundedRect(margin, boxTop, contentWidth, 42, 4).fillAndStroke('#f8fafc', '#cbd5e1');

  // Booking Ref
  doc
    .fillColor('#64748b')
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('BOOKING REFERENCE', margin + 14, boxTop + 8);

  doc
    .fillColor('#0f766e')
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(booking.bookingCode, margin + 14, boxTop + 19);

  // Issue Date
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('DATE OF ISSUE', margin + 160, boxTop + 8);

  doc
    .fillColor('#1e293b')
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .text(formatDate(booking.createdAt), margin + 160, boxTop + 21);

  // Booking Status Badge
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('BOOKING STATUS', margin + 270, boxTop + 8);

  const statusLabel = booking.bookingStatus.toUpperCase();
  const statusColor = isConfirmed
    ? '#047857'
    : booking.bookingStatus === 'cancelled'
      ? '#b91c1c'
      : '#d97706';
  doc
    .fillColor(statusColor)
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .text(statusLabel, margin + 270, boxTop + 21);

  // Payment Status Badge
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('PAYMENT STATUS', margin + 390, boxTop + 8);

  const paymentLabel = booking.paymentStatus.toUpperCase();
  const paymentColor =
    booking.paymentStatus === 'paid'
      ? '#047857'
      : booking.paymentStatus === 'partial'
        ? '#0284c7'
        : '#b91c1c';
  doc
    .fillColor(paymentColor)
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .text(paymentLabel, margin + 390, boxTop + 21);

  // --- SECTION: TOUR & JOURNEY DETAILS ---
  let cursorY = 180;

  function renderSectionHeader(title: string, y: number) {
    doc.rect(margin, y, contentWidth, 18).fill('#f1f5f9');
    doc
      .fillColor('#0f766e')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text(title, margin + 8, y + 5);
  }

  renderSectionHeader('TOUR & JOURNEY SCHEDULE', cursorY);
  cursorY += 24;

  const col1Left = margin + 8;
  const col2Left = margin + 260;

  // Tour Name
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Tour / Package:', col1Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(template.title, col1Left + 80, cursorY, { width: 165 });

  // Destination
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Destination:', col2Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(template.destination, col2Left + 80, cursorY, { width: 165 });

  cursorY += 18;

  // Departure Date
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Departure Date:', col1Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(formatDate(event.startDate), col1Left + 80, cursorY);

  // Return Date
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Return Date:', col2Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(9)
    .text(formatDate(event.endDate), col2Left + 80, cursorY);

  cursorY += 18;

  // Duration
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Duration:', col1Left, cursorY);
  const nights = template.durationDays > 1 ? `${template.durationDays - 1} Nights` : 'Day Trip';
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(9)
    .text(`${template.durationDays} Days / ${nights}`, col1Left + 80, cursorY);

  // Reporting Time
  const defaultPickup = event.pickupPoints?.[0];
  const reportingTime = defaultPickup?.time
    ? `${defaultPickup.time} (30 mins before departure)`
    : '06:30 AM';
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Reporting Time:', col2Left, cursorY);
  doc
    .fillColor('#b45309')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(reportingTime, col2Left + 80, cursorY);

  cursorY += 18;

  // Boarding Point
  const boardingPoint =
    booking.pickupPoint || defaultPickup?.name || 'Sayedabad Bus Terminal, Dhaka';
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Boarding Point:', col1Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(8.5)
    .text(boardingPoint, col1Left + 80, cursorY, { width: 410 });

  cursorY += 24;

  // --- SECTION: VEHICLE & PASSENGER SEAT ALLOCATION ---
  renderSectionHeader('TRANSPORTATION & SEAT ALLOCATION', cursorY);
  cursorY += 24;

  // Dedicated Bus (Bus Assignment Rule: 1 bus per event)
  const busName = bus ? `${bus.name} (${bus.registrationNumber})` : 'Labib Express AC Coach';
  const busType = bus
    ? `${bus.type.toUpperCase()} (${bus.isAC ? 'Air Conditioned' : 'Non-AC'})`
    : 'Air Conditioned Coach';

  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Dedicated Bus:', col1Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(busName, col1Left + 80, cursorY, { width: 165 });

  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Bus Type / Class:', col2Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(9)
    .text(busType, col2Left + 80, cursorY);

  cursorY += 18;

  // Package Tier
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Package Tier:', col1Left, cursorY);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(booking.bookingType.toUpperCase(), col1Left + 80, cursorY);

  // Confirmed Seat Numbers
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(7.5)
    .text('Assigned Seats:', col2Left, cursorY);
  const seatStr = booking.seatNumbers.join(', ');
  doc
    .fillColor('#0f766e')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(seatStr, col2Left + 80, cursorY);

  cursorY += 22;

  // --- SECTION: PASSENGER DETAILS ---
  renderSectionHeader(`PASSENGER ROSTER (${booking.personCount} PERSONS)`, cursorY);
  cursorY += 22;

  // Table header for passengers
  doc.rect(margin, cursorY, contentWidth, 14).fill('#e2e8f0');
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(7.5);
  doc.text('#', margin + 6, cursorY + 3);
  doc.text('PASSENGER NAME', margin + 25, cursorY + 3);
  doc.text('PHONE NUMBER', margin + 175, cursorY + 3);
  doc.text('SEAT', margin + 290, cursorY + 3);
  doc.text('EMERGENCY CONTACT', margin + 350, cursorY + 3);

  cursorY += 15;

  const guests = booking.guestDetails || [];
  guests.forEach((g, idx) => {
    const assignedSeat = booking.seatNumbers[idx] || 'N/A';
    const rowY = cursorY;
    if (idx % 2 === 1) {
      doc.rect(margin, rowY, contentWidth, 14).fill('#f8fafc');
    }

    doc.fillColor('#1e293b').font('Helvetica').fontSize(7.5);
    doc.text(String(idx + 1), margin + 6, rowY + 3);
    doc
      .font('Helvetica-Bold')
      .text(g.name || customer?.name || 'Guest', margin + 25, rowY + 3, { width: 145 });
    doc.font('Helvetica').text(g.phone || customer?.phone || 'N/A', margin + 175, rowY + 3);
    doc
      .font('Helvetica-Bold')
      .fillColor('#0f766e')
      .text(assignedSeat, margin + 290, rowY + 3);

    const emer = g.emergencyContact
      ? `${g.emergencyContactName ? g.emergencyContactName + ': ' : ''}${g.emergencyContact}`
      : 'N/A';
    doc
      .fillColor('#1e293b')
      .font('Helvetica')
      .text(emer, margin + 350, rowY + 3, { width: 155 });

    cursorY += 15;
  });

  cursorY += 8;

  // --- SECTION: BILLING & PAYMENT SUMMARY ---
  renderSectionHeader('PAYMENT & FINANCIAL SUMMARY', cursorY);
  cursorY += 22;

  // Financial summary box (table style)
  const finWidth = 240;
  const finLeft = margin + contentWidth - finWidth;

  // Left column: Tour Host & Dispatch info
  doc
    .fillColor('#64748b')
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('TOUR HOST & DISPATCH HOTLINE', margin + 8, cursorY);
  const hostName = hostUser?.name || 'Assigned Tour Coordinator';
  const hostPhone = hostUser?.phone || '+880 1700-000000';
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(8)
    .text(`Coordinator: ${hostName}`, margin + 8, cursorY + 14);
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(8)
    .text(`Host Contact: ${hostPhone}`, margin + 8, cursorY + 26);
  doc
    .fillColor('#0f172a')
    .font('Helvetica')
    .fontSize(8)
    .text(`Emergency Support: ${COMPANY_INFO.phone}`, margin + 8, cursorY + 38);

  // Right column: Financial Table
  const financeRows = [
    {
      label: `Package Price (${booking.bookingType.toUpperCase()} x ${booking.personCount})`,
      value: formatBDT(trustedFinance.subtotal),
    },
    ...(trustedFinance.discount > 0
      ? [{ label: 'Discount', value: `- ${formatBDT(trustedFinance.discount)}` }]
      : []),
    { label: 'Total Booking Amount', value: formatBDT(trustedFinance.totalAmount), bold: true },
    {
      label: 'Amount Received',
      value: formatBDT(trustedFinance.receivedAmount),
      bold: true,
      color: '#047857',
    },
    {
      label: 'Outstanding Balance Due',
      value: formatBDT(trustedFinance.dueAmount),
      bold: true,
      color: trustedFinance.dueAmount > 0 ? '#b91c1c' : '#475569',
    },
  ];

  let finY = cursorY;
  financeRows.forEach((r) => {
    doc
      .fillColor('#475569')
      .font(r.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(8)
      .text(r.label, finLeft, finY);
    doc
      .fillColor(r.color || '#0f172a')
      .font(r.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(8)
      .text(r.value, finLeft + 120, finY, { width: 120, align: 'right' });
    finY += 13;
  });

  cursorY = Math.max(cursorY + 60, finY + 10);

  // --- SECTION: IMPORTANT INSTRUCTIONS FOR PASSENGERS ---
  doc.roundedRect(margin, cursorY, contentWidth, 54, 4).fillAndStroke('#fefce8', '#fef08a'); // soft amber warning box

  doc
    .fillColor('#854d0e')
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('IMPORTANT TRAVEL INSTRUCTIONS:', margin + 10, cursorY + 7);

  const instructions = [
    '1. Please present this document (printed A4 copy or digital PDF on your phone) along with valid photo ID at boarding.',
    '2. Passengers must report to the boarding counter at least 30 minutes before the scheduled departure time.',
    '3. Confirmed seats are strictly allocated as designated above. Seat switching is not permitted without coordinator approval.',
    '4. For any emergency or route assistance on travel day, please contact your assigned Tour Host or the Dispatch Hotline.',
  ];

  let instY = cursorY + 18;
  instructions.forEach((ins) => {
    doc
      .fillColor('#713f12')
      .font('Helvetica')
      .fontSize(6.8)
      .text(ins, margin + 10, instY, { width: contentWidth - 20 });
    instY += 8.5;
  });

  // --- FOOTER ---
  const footerY = 785;
  doc
    .moveTo(margin, footerY - 8)
    .lineTo(margin + contentWidth, footerY - 8)
    .lineWidth(0.5)
    .strokeColor('#cbd5e1')
    .stroke();

  doc
    .fillColor('#94a3b8')
    .font('Helvetica')
    .fontSize(7)
    .text(
      'This is an official computer-generated document issued by Labib Tour Management System. No physical signature is required.',
      margin,
      footerY,
      { width: contentWidth, align: 'center' },
    );

  doc
    .fillColor('#94a3b8')
    .font('Helvetica')
    .fontSize(6.5)
    .text(
      `Generated on ${new Date().toISOString()}  |  Document ID: ${booking._id.toString()}  |  Page 1 of 1`,
      margin,
      footerY + 10,
      { width: contentWidth, align: 'center' },
    );

  // Finalize PDFKit document
  doc.end();

  const safeBookingCode = booking.bookingCode.replace(/[^A-Za-z0-9_-]/g, '');
  const prefix = documentType === 'ticket' ? 'ticket' : 'receipt';
  const filename = `${prefix}-${safeBookingCode}.pdf`;

  return {
    doc,
    filename,
    bookingCode: booking.bookingCode,
  };
}
