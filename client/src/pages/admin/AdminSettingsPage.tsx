import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { DEFAULT_COMPANY_SETTINGS } from '@/features/admin/data/settings';
import type { CompanySettings } from '@/features/admin/types';
import { TOUR_CATEGORY_LABELS, type TourCategory } from '@/features/tours/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { formatBDT } from '@/lib/format';

/**
 * General settings + the brief's explicit "Minimum Advance must be
 * configurable... Admin can change these values without code changes"
 * requirement. `minimumAdvance` here is exactly the map
 * `features/booking/utils/pricing.ts` currently hardcodes — once
 * connected to a real Settings API, that pricing utility reads from
 * here instead of its own constant, with zero code changes on the
 * Booking module's side (same shape, different source).
 */
export function AdminSettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  const patch = (p: Partial<CompanySettings>) => setSettings((s) => ({ ...s, ...p }));
  const patchAdvance = (category: TourCategory, value: number) =>
    setSettings((s) => ({ ...s, minimumAdvance: { ...s.minimumAdvance, [category]: value } }));

  const updateSocialLink = (index: number, url: string) =>
    setSettings((s) => ({
      ...s,
      socialLinks: s.socialLinks.map((l, i) => (i === index ? { ...l, url } : l)),
    }));
  const removeSocialLink = (index: number) =>
    setSettings((s) => ({ ...s, socialLinks: s.socialLinks.filter((_, i) => i !== index) }));
  const addSocialLink = () =>
    setSettings((s) => ({
      ...s,
      socialLinks: [...s.socialLinks, { platform: 'New Platform', url: '' }],
    }));

  const handleSave = () => toast.success('Settings saved');

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Settings"
        description="Company information, contact details, and business rules."
        actions={<Button onClick={handleSave}>Save Changes</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="s-company">Company Name</Label>
            <Input
              id="s-company"
              value={settings.companyName}
              onChange={(e) => patch({ companyName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-logo">Logo URL</Label>
            <Input
              id="s-logo"
              value={settings.logoUrl}
              onChange={(e) => patch({ logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-favicon">Favicon URL</Label>
            <Input
              id="s-favicon"
              value={settings.faviconUrl}
              onChange={(e) => patch({ faviconUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-email">Support Email</Label>
            <Input
              id="s-email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => patch({ supportEmail: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-phone">Support Phone</Label>
            <Input
              id="s-phone"
              type="tel"
              value={settings.supportPhone}
              onChange={(e) => patch({ supportPhone: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-whatsapp">WhatsApp Number</Label>
            <Input
              id="s-whatsapp"
              value={settings.whatsappNumber}
              onChange={(e) => patch({ whatsappNumber: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Theme</Label>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {settings.socialLinks.map((link, i) => (
            <div key={`${link.platform}-${i}`} className="flex items-center gap-2">
              <Input value={link.platform} disabled className="w-32 shrink-0" />
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(i, e.target.value)}
                placeholder="https://..."
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${link.platform}`}
                onClick={() => removeSocialLink(i)}
              >
                <Trash2 className="text-destructive size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-fit gap-2" onClick={addSocialLink}>
            <Plus className="size-4" />
            Add Social Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum Advance by Tour Category</CardTitle>
          <p className="text-muted-foreground text-sm">
            These values drive the Booking module's minimum-advance calculation — change them here,
            no code changes needed.
          </p>
        </CardHeader>
        <CardContent className="laptop:grid-cols-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(TOUR_CATEGORY_LABELS) as TourCategory[]).map((category) => (
            <div key={category} className="flex flex-col gap-1.5">
              <Label htmlFor={`advance-${category}`}>{TOUR_CATEGORY_LABELS[category]}</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  ৳
                </span>
                <Input
                  id={`advance-${category}`}
                  type="number"
                  min={0}
                  step={100}
                  className="pl-7"
                  value={settings.minimumAdvance[category]}
                  onChange={(e) => patchAdvance(category, Number(e.target.value))}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Currently {formatBDT(settings.minimumAdvance[category])} per guest
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
