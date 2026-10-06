import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Globe2, CalendarCheck2, Star, CheckCircle2, Pencil, X, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  hostProfileSchema,
  type HostProfileFormValues,
} from '@/features/host/schemas/host-profile.schema';
import type { HostProfile } from '@/features/host/types';

interface HostProfileViewProps {
  profile: HostProfile;
  onUpdateProfile: (patch: Partial<HostProfile>) => Promise<HostProfile>;
}

export function HostProfileView({ profile, onUpdateProfile }: HostProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HostProfileFormValues>({
    resolver: zodResolver(hostProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      experience: profile.experience,
      bio: profile.bio,
      languages: profile.languages.join(', '),
      emergencyContact: profile.emergencyContact,
    },
  });

  const onSubmit = async (values: HostProfileFormValues) => {
    try {
      await onUpdateProfile({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        whatsapp: values.whatsapp,
        experience: values.experience,
        bio: values.bio,
        languages: values.languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        emergencyContact: values.emergencyContact,
        avatarUrl,
      });

      toast.success('Guide profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update guide profile. Please try again.');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handlePhotoUploadPlaceholder = () => {
    setAvatarUrl(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    );
    toast.info('Guide photo updated (preview placeholder)');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Card: Host Bio & Stats */}
      <Card className="border-border bg-card overflow-hidden shadow-xs">
        <div className="from-primary-950 via-primary-900 to-primary-800 flex flex-col items-start justify-between gap-5 bg-gradient-to-r p-5 text-white sm:p-6 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="group relative">
              <Avatar className="size-20 border-2 border-white/20 shadow-md sm:size-24">
                <AvatarImage src={avatarUrl} alt={profile.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {profile.fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <button
                  type="button"
                  onClick={handlePhotoUploadPlaceholder}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Change Photo"
                >
                  <Camera className="size-5" />
                </button>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h3 className="font-display text-xl font-black text-white sm:text-2xl">
                  {profile.fullName}
                </h3>
                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                  VERIFIED TOUR LEADER
                </Badge>
              </div>

              <p className="text-primary-100/90 mt-1 text-xs font-medium">
                {profile.experience} • Lead Guide
              </p>

              <div className="text-primary-100 mt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:justify-start">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-white">{profile.rating}</strong> (Field Rating)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CalendarCheck2 className="text-primary-200 size-3.5" />
                  <strong className="text-white">{profile.totalToursGuided}</strong> Tours Guided
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe2 className="text-primary-200 size-3.5" />
                  <span>{profile.languages.join(', ')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="self-center md:self-auto">
            {!isEditing ? (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-primary-950 gap-1.5 bg-white font-bold shadow-sm hover:bg-white/90"
              >
                <Pencil className="size-3.5" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="gap-1 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <X className="size-3.5" />
                <span>Cancel</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Details Form & Info */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Field Tour Leader Information</CardTitle>
          <CardDescription className="text-xs">
            Your qualifications, primary contact numbers, languages, and emergency backup contacts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold">
                  Full Legal Name
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  disabled={!isEditing}
                  className="h-9 text-xs"
                />
                {errors.fullName && (
                  <p className="text-destructive text-[11px]">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Host Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing}
                  className="h-9 text-xs"
                />
                {errors.email && (
                  <p className="text-destructive text-[11px]">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Primary Mobile Phone
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  disabled={!isEditing}
                  className="h-9 text-xs"
                />
                {errors.phone && (
                  <p className="text-destructive text-[11px]">{errors.phone.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-semibold">
                  WhatsApp Contact Number
                </Label>
                <Input
                  id="whatsapp"
                  {...register('whatsapp')}
                  disabled={!isEditing}
                  className="h-9 text-xs"
                />
                {errors.whatsapp && (
                  <p className="text-destructive text-[11px]">{errors.whatsapp.message}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <Label htmlFor="experience" className="text-xs font-semibold">
                  Experience Title / Rank
                </Label>
                <Input
                  id="experience"
                  {...register('experience')}
                  disabled={!isEditing}
                  className="h-9 text-xs"
                />
                {errors.experience && (
                  <p className="text-destructive text-[11px]">{errors.experience.message}</p>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-1.5">
                <Label htmlFor="languages" className="text-xs font-semibold">
                  Spoken Languages (comma separated)
                </Label>
                <Input
                  id="languages"
                  {...register('languages')}
                  disabled={!isEditing}
                  placeholder="Bangla, English, Sylheti, Chittagonian"
                  className="h-9 text-xs"
                />
                {errors.languages && (
                  <p className="text-destructive text-[11px]">{errors.languages.message}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="emergencyContact" className="text-xs font-semibold">
                  Emergency Relative / Medical Contact
                </Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  disabled={!isEditing}
                  placeholder="Kabir Ahmed (Brother) - +880 1819-998877"
                  className="h-9 text-xs"
                />
                {errors.emergencyContact && (
                  <p className="text-destructive text-[11px]">{errors.emergencyContact.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bio" className="text-xs font-semibold">
                  Tour Leader Bio &amp; Wilderness Expertise
                </Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  disabled={!isEditing}
                  rows={4}
                  className="resize-none text-xs"
                />
                {errors.bio && <p className="text-destructive text-[11px]">{errors.bio.message}</p>}
              </div>
            </div>

            {/* Form Action Controls */}
            {isEditing && (
              <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
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
                  disabled={!isDirty}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
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
