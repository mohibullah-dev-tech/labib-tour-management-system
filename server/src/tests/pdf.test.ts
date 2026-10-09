/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import test from 'node:test';
import { Types } from 'mongoose';
import { generateBookingPdf } from '@/modules/bookings/bookingPdf.service.js';
import { Booking, TourEvent, TourTemplate, Bus, User, HostProfile } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { disconnectRedis } from '@/config/redis.js';

test.after(async () => {
  await disconnectRedis();
});

test('Phase 17 — PDF Booking Slip & Confirmation System', async (suite) => {
  const customerId = new Types.ObjectId().toString();
  const otherCustomerId = new Types.ObjectId().toString();
  const hostId = new Types.ObjectId().toString();
  const otherHostId = new Types.ObjectId().toString();
  const adminId = new Types.ObjectId().toString();

  const mockBusId = new Types.ObjectId();
  const mockEventId = new Types.ObjectId();
  const mockTemplateId = new Types.ObjectId();
  const mockBookingId = new Types.ObjectId();

  const mockBookingData: any = {
    _id: mockBookingId,
    bookingCode: 'LT-CONF-123456',
    customerId: new Types.ObjectId(customerId),
    eventId: mockEventId,
    tourTemplateId: mockTemplateId,
    bookingType: 'single',
    personCount: 2,
    seatNumbers: ['A1', 'A2'],
    guestDetails: [
      {
        name: 'Mohibullah Lead Traveler With Very Long Name Testing Text Wrapping Support In PDF Document Generator',
        phone: '+8801700112233',
        email: 'mohib@example.com',
        address:
          'House 42, Road 11, Sector 4, Uttara, Dhaka-1230, Bangladesh with extended locality detail',
        emergencyContactName: 'Kamal Ahmed',
        emergencyContact: '+8801811223344',
      },
      {
        name: 'Sadia Rahman',
        phone: '+8801799887766',
        email: 'sadia@example.com',
      },
    ],
    packagePrice: 4500,
    subtotal: 9000,
    discount: 500,
    totalAmount: 8500,
    minimumAdvancePercent: 30,
    minimumAdvance: 2550,
    receivedAmount: 3000,
    dueAmount: 5500,
    paymentStatus: 'partial',
    bookingStatus: 'confirmed',
    pickupPoint: 'Sayedabad Bus Terminal, Dhaka',
    createdAt: new Date('2026-10-09T10:00:00Z'),
  };

  const mockTemplateData: any = {
    _id: mockTemplateId,
    title: 'Sajek Valley Cloud Kingdom Retreat',
    destination: 'Sajek Valley, Rangamati',
    tourType: 'relax',
    durationDays: 3,
    pricing: {
      basePrice: 4500,
      packagePrices: new Map([
        ['single', 4500],
        ['couple', 9000],
      ]),
    },
    minimumAdvancePercent: 30,
  };

  const mockEventData: any = {
    _id: mockEventId,
    busId: mockBusId,
    hostId: new Types.ObjectId(hostId),
    startDate: new Date('2026-11-15T06:00:00Z'),
    endDate: new Date('2026-11-18T20:00:00Z'),
    pickupPoints: [
      { name: 'Sayedabad Central Terminal', address: 'Sayedabad, Dhaka', time: '06:00' },
    ],
    currency: 'BDT',
  };

  const mockBusData: any = {
    _id: mockBusId,
    name: 'Labib Royal Star Liner',
    registrationNumber: 'DHAKA-METRO-BA-11-2041',
    type: 'coach',
    isAC: true,
  };

  const mockUserData: any = {
    _id: new Types.ObjectId(customerId),
    name: 'Mohibullah',
    phone: '+8801700112233',
    email: 'mohib@example.com',
    role: 'guest',
  };

  const mockHostData: any = {
    _id: new Types.ObjectId(hostId),
    name: 'Rahim Tour Coordinator',
    phone: '+8801711223344',
    email: 'rahim@labibtours.com',
    role: 'host',
  };

  // Mock Mongoose model queries
  const originalBookingFindOne = Booking.findOne;
  const originalTourEventFindById = TourEvent.findById;
  const originalTourTemplateFindById = TourTemplate.findById;
  const originalBusFindById = Bus.findById;
  const originalUserFindById = User.findById;
  const originalHostProfileFindOne = HostProfile.findOne;

  Booking.findOne = ((query: any) => ({
    lean: async () => {
      if (query._id && query._id.toString() === mockBookingId.toString())
        return { ...mockBookingData };
      if (query.bookingCode && query.bookingCode === mockBookingData.bookingCode)
        return { ...mockBookingData };
      return null;
    },
  })) as any;

  TourEvent.findById = (() => ({
    lean: async () => ({ ...mockEventData }),
  })) as any;

  TourTemplate.findById = (() => ({
    lean: async () => ({ ...mockTemplateData }),
  })) as any;

  Bus.findById = (() => ({
    lean: async () => ({ ...mockBusData }),
  })) as any;

  User.findById = ((id: any) => ({
    select: () => ({
      lean: async () => {
        if (id.toString() === customerId) return { ...mockUserData };
        if (id.toString() === hostId) return { ...mockHostData };
        return null;
      },
    }),
  })) as any;

  HostProfile.findOne = (() => ({
    lean: async () => ({ assignedEventIds: [mockEventId] }),
  })) as any;

  suite.after(() => {
    Booking.findOne = originalBookingFindOne;
    TourEvent.findById = originalTourEventFindById;
    TourTemplate.findById = originalTourTemplateFindById;
    Bus.findById = originalBusFindById;
    User.findById = originalUserFindById;
    HostProfile.findOne = originalHostProfileFindOne;
  });

  await suite.test('1. Confirmed booking generates valid PDF document stream', async () => {
    const result = await generateBookingPdf({
      bookingId: mockBookingId.toString(),
      documentType: 'ticket',
      user: { id: customerId, role: 'guest' },
    });

    assert.equal(result.bookingCode, 'LT-CONF-123456');
    assert.equal(result.filename, 'ticket-LT-CONF-123456.pdf');
    assert.ok(result.doc);

    // Verify stream emits binary chunks with standard PDF header '%PDF-'
    const chunks: Buffer[] = [];
    result.doc.on('data', (c) => chunks.push(c));

    await new Promise<void>((resolve) => {
      result.doc.on('end', () => resolve());
    });

    const pdfBuffer = Buffer.concat(chunks);
    assert.ok(pdfBuffer.length > 500, 'PDF buffer should contain generated ticket bytes');
    assert.equal(pdfBuffer.subarray(0, 5).toString('ascii'), '%PDF-');
  });

  await suite.test('2. Pending booking cannot be generated as confirmed ticket', async () => {
    const originalStatus = mockBookingData.bookingStatus;
    mockBookingData.bookingStatus = 'pending';

    await assert.rejects(
      async () => {
        await generateBookingPdf({
          bookingId: mockBookingId.toString(),
          documentType: 'ticket',
          user: { id: customerId, role: 'guest' },
        });
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /not eligible for a confirmed ticket/i);
        return true;
      },
    );

    mockBookingData.bookingStatus = originalStatus;
  });

  await suite.test('3. Pending booking can generate official receipt', async () => {
    const originalStatus = mockBookingData.bookingStatus;
    mockBookingData.bookingStatus = 'pending';

    const result = await generateBookingPdf({
      bookingId: mockBookingId.toString(),
      documentType: 'receipt',
      user: { id: customerId, role: 'guest' },
    });

    assert.equal(result.filename, 'receipt-LT-CONF-123456.pdf');
    assert.ok(result.doc);

    mockBookingData.bookingStatus = originalStatus;
  });

  await suite.test('4. Guest cannot download another guest’s ticket', async () => {
    await assert.rejects(
      async () => {
        await generateBookingPdf({
          bookingId: mockBookingId.toString(),
          documentType: 'ticket',
          user: { id: otherCustomerId, role: 'guest' },
        });
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /not authorized/i);
        return true;
      },
    );
  });

  await suite.test('5. Host can download ticket for their assigned event', async () => {
    const result = await generateBookingPdf({
      bookingId: mockBookingId.toString(),
      documentType: 'ticket',
      user: { id: hostId, role: 'host' },
    });

    assert.ok(result.doc);
  });

  await suite.test('6. Host cannot download ticket for an unassigned event', async () => {
    HostProfile.findOne = (() => ({
      lean: async () => ({ assignedEventIds: [] }),
    })) as any;

    await assert.rejects(
      async () => {
        await generateBookingPdf({
          bookingId: mockBookingId.toString(),
          documentType: 'ticket',
          user: { id: otherHostId, role: 'host' },
        });
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /assigned events/i);
        return true;
      },
    );

    HostProfile.findOne = (() => ({
      lean: async () => ({ assignedEventIds: [mockEventId] }),
    })) as any;
  });

  await suite.test('7. Admin can download any booking ticket', async () => {
    const result = await generateBookingPdf({
      bookingId: mockBookingId.toString(),
      documentType: 'ticket',
      user: { id: adminId, role: 'admin' },
    });

    assert.ok(result.doc);
  });

  await suite.test('8. Missing booking returns 404 not found', async () => {
    await assert.rejects(
      async () => {
        await generateBookingPdf({
          bookingId: new Types.ObjectId().toString(),
          documentType: 'ticket',
          user: { id: adminId, role: 'admin' },
        });
      },
      (err: any) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 404);
        return true;
      },
    );
  });

  await suite.test('9. Missing optional host and pickup points fall back gracefully', async () => {
    const originalHostId = mockEventData.hostId;
    const originalPickup = mockEventData.pickupPoints;
    mockEventData.hostId = null;
    mockEventData.pickupPoints = [];

    const result = await generateBookingPdf({
      bookingId: mockBookingId.toString(),
      documentType: 'ticket',
      user: { id: adminId, role: 'admin' },
    });

    assert.ok(result.doc);

    mockEventData.hostId = originalHostId;
    mockEventData.pickupPoints = originalPickup;
  });
});
