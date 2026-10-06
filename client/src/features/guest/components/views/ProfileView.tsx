import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, ShieldAlert, CheckCircle2, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuestProfileCard } from '@/features/guest/components/GuestProfileCard';
import {
  guestProfileSchema,
  type GuestProfileFormValues,
} from '@/features/guest/schemas/profile.schema';
import type { GuestProfile } from '@/features/guest/types';

interface ProfileViewProps {
  profile: GuestProfile;
  onUpdateProfile: (patch: Partial<GuestProfile>) => Promise<GuestProfile>;
}

export function ProfileView({ profile, onUpdateProfile }: ProfileViewProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GuestProfileFormValues>({
    resolver: zodResolver(guestProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      emergencyContact: profile.emergencyContact,
      preferredPickupLocation: profile.preferredPickupLocation,
    },
  });

  const onSubmit = async (values: GuestProfileFormValues) => {
    try {
      await onUpdateProfile({
        ...values,
        avatarUrl,
      });
      toast.success('Profile updated successfully!', {
        description: 'Your traveler details and preferred pickup point have been saved.',
      });
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    reset({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      emergencyContact: profile.emergencyContact,
      preferredPickupLocation: profile.preferredPickupLocation,
    });
    setAvatarUrl(profile.avatarUrl);
    setIsEditing(false);
  };

  const handleChangePhotoPlaceholder = () => {
    const demoAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    ];
    const nextAvatar = demoAvatars[Math.floor(Math.random() * demoAvatars.length)];
    setAvatarUrl(nextAvatar);
    setIsEditing(true);
    toast.info('New photo selected (click Save to confirm)');
  };

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Overview Card */}
      <GuestProfileCard profile={{ ...profile, avatarUrl }} />

      {/* Main Profile Edit Form */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <User className="size-4" />
              <span>Personal Information</span>
            </div>
            <CardTitle className="text-xl">Traveler Profile Details</CardTitle>
            <CardDescription className="text-xs">
              Keep your contact and emergency information updated for safe holiday travel.
            </CardDescription>
          </div>

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsEditing(true)}
            >
              Edit Details
            </Button>
          ) : (
            <span className="animate-pulse text-xs font-semibold text-amber-600 dark:text-amber-400">
              Editing Mode
            </span>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Profile Avatar Editor */}
            <div className="bg-muted/40 border-border flex items-center gap-4 rounded-xl border p-4">
              <div className="group relative">
                <Avatar className="border-primary/20 size-16 border-2">
                  <AvatarImage src={avatarUrl} alt={profile.fullName} />
                  <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
                </Avatar>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleChangePhotoPlaceholder}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Change profile photo"
                  >
                    <Camera className="size-5" />
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-foreground text-sm font-semibold">Profile Photo</h4>
                <p className="text-muted-foreground text-xs">
                  Your photo helps tour hosts identify you at the boarding point.
                </p>
                {isEditing && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary mt-1 h-auto p-0 text-xs font-medium"
                    onClick={handleChangePhotoPlaceholder}
                  >
                    Upload New Photo
                  </Button>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prof-name" className="text-xs font-semibold">
                  Full Name (NID / Passport)
                </Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="prof-name"
                    disabled={!isEditing}
                    invalid={!!errors.fullName}
                    className="pl-9 text-xs sm:text-sm"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-destructive text-xs">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prof-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="prof-email"
                    type="email"
                    disabled={!isEditing}
                    invalid={!!errors.email}
                    className="pl-9 text-xs sm:text-sm"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prof-phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="prof-phone"
                    disabled={!isEditing}
                    invalid={!!errors.phone}
                    className="pl-9 font-mono text-xs sm:text-sm"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
              </div>

              {/* Emergency Contact */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="prof-emergency"
                  className="flex items-center gap-1 text-xs font-semibold"
                >
                  <ShieldAlert className="size-3 text-rose-500" />
                  <span>Emergency Contact (Relationship &amp; Phone)</span>
                </Label>
                <Input
                  id="prof-emergency"
                  disabled={!isEditing}
                  invalid={!!errors.emergencyContact}
                  className="text-xs sm:text-sm"
                  {...register('emergencyContact')}
                />
                {errors.emergencyContact && (
                  <p className="text-destructive text-xs">{errors.emergencyContact.message}</p>
                )}
              </div>

              {/* Preferred Pickup Point */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label
                  htmlFor="prof-pickup"
                  className="flex items-center gap-1 text-xs font-semibold"
                >
                  <MapPin className="text-primary size-3" />
                  <span>Preferred Boarding / Pickup Location</span>
                </Label>
                <Input
                  id="prof-pickup"
                  disabled={!isEditing}
                  invalid={!!errors.preferredPickupLocation}
                  placeholder="e.g. Abdullahpur, Sayedabad, Arambagh, Gabtoli"
                  className="text-xs sm:text-sm"
                  {...register('preferredPickupLocation')}
                />
                {errors.preferredPickupLocation && (
                  <p className="text-destructive text-xs">
                    {errors.preferredPickupLocation.message}
                  </p>
                )}
              </div>

              {/* Residential Address */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="prof-address" className="text-xs font-semibold">
                  Full Mailing / Residential Address
                </Label>
                <Input
                  id="prof-address"
                  disabled={!isEditing}
                  invalid={!!errors.address}
                  className="text-xs sm:text-sm"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-destructive text-xs">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Edit Action Bar */}
            {isEditing && (
              <div className="border-border flex items-center justify-end gap-2.5 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={!isDirty && avatarUrl === profile.avatarUrl}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
