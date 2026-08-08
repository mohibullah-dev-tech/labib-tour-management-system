import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GuestFormData } from '@/features/booking/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const guestFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(11, 'Enter a valid phone number').max(15, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(5, 'Address is required'),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(11, 'Enter a valid phone number')
    .max(15, 'Enter a valid phone number'),
  specialNotes: z.string().optional().default(''),
});

export interface GuestFormProps {
  defaultValues: GuestFormData;
  packageName: string;
  onSubmit: (data: GuestFormData) => void;
  onBack: () => void;
}

/**
 * react-hook-form + zod — matches the project's chosen form stack
 * exactly, so this validates identically to how every other form in the
 * app will. `onSubmit` only receives validated data; wiring it to a real
 * `POST /api/v1/bookings` call later is a one-line change inside
 * BookingDetailsStep, not here.
 */
function GuestForm({ defaultValues, packageName, onSubmit, onBack }: GuestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="border-border bg-muted/40 text-muted-foreground rounded-md border p-3 text-sm">
        Booking Type: <span className="text-foreground font-medium">{packageName}</span> (selected
        in the previous step)
      </div>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Guest information</legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p id="fullName-error" className="text-destructive text-xs">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="phone-error" className="text-destructive text-xs">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-destructive text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pickupLocation">Pickup Location</Label>
          <Input
            id="pickupLocation"
            invalid={!!errors.pickupLocation}
            aria-describedby={errors.pickupLocation ? 'pickup-error' : undefined}
            {...register('pickupLocation')}
          />
          {errors.pickupLocation && (
            <p id="pickup-error" className="text-destructive text-xs">
              {errors.pickupLocation.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            invalid={!!errors.address}
            aria-describedby={errors.address ? 'address-error' : undefined}
            {...register('address')}
          />
          {errors.address && (
            <p id="address-error" className="text-destructive text-xs">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            invalid={!!errors.emergencyContactName}
            aria-describedby={errors.emergencyContactName ? 'ecn-error' : undefined}
            {...register('emergencyContactName')}
          />
          {errors.emergencyContactName && (
            <p id="ecn-error" className="text-destructive text-xs">
              {errors.emergencyContactName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            invalid={!!errors.emergencyContactPhone}
            aria-describedby={errors.emergencyContactPhone ? 'ecp-error' : undefined}
            {...register('emergencyContactPhone')}
          />
          {errors.emergencyContactPhone && (
            <p id="ecp-error" className="text-destructive text-xs">
              {errors.emergencyContactPhone.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="specialNotes">Special Notes (optional)</Label>
          <Textarea
            id="specialNotes"
            placeholder="Dietary restrictions, accessibility needs, etc."
            {...register('specialNotes')}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to Summary</Button>
      </div>
    </form>
  );
}

export { GuestForm };
