import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { DEFAULT_WEBSITE_CONTENT } from '@/features/admin/data/content';
import type { WebsiteContentSettings, WebsiteFaqEntry } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

/**
 * One settings-style form per public-site section (Hero Banner,
 * Homepage Statistics, FAQ, About, Contact, Footer), tabbed to keep a
 * dense form navigable. Every field here maps directly onto what the
 * public Home/FAQ/About/Contact pages already render — connecting a
 * `GET /api/v1/admin/content` later replaces DEFAULT_WEBSITE_CONTENT as
 * this form's source, and (in a later phase) the public pages read from
 * the same endpoint instead of their own hardcoded copy.
 */
export function AdminContentPage() {
  const [content, setContent] = useState<WebsiteContentSettings>(DEFAULT_WEBSITE_CONTENT);

  const patch = (p: Partial<WebsiteContentSettings>) => setContent((c) => ({ ...c, ...p }));
  const handleSave = () => toast.success('Website content saved');

  const addFaq = () =>
    patch({ faq: [...content.faq, { id: `faq-${Date.now()}`, question: '', answer: '' }] });
  const updateFaq = (id: string, p: Partial<WebsiteFaqEntry>) =>
    patch({ faq: content.faq.map((f) => (f.id === id ? { ...f, ...p } : f)) });
  const removeFaq = (id: string) => patch({ faq: content.faq.filter((f) => f.id !== id) });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Website Content"
        description="Manage the public site's hero banner, homepage statistics, FAQ, About, Contact, and Footer content."
        actions={<Button onClick={handleSave}>Save Changes</Button>}
      />

      <Tabs defaultValue="hero">
        <TabsList className="flex-wrap">
          <TabsTrigger value="hero">Hero Banner</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Field label="Headline">
                <Input
                  value={content.heroHeadline}
                  onChange={(e) => patch({ heroHeadline: e.target.value })}
                />
              </Field>
              <Field label="Subheadline">
                <Textarea
                  value={content.heroSubheadline}
                  onChange={(e) => patch({ heroSubheadline: e.target.value })}
                />
              </Field>
              <Field label="Background Image URL">
                <Input
                  value={content.heroBackgroundImage}
                  onChange={(e) => patch({ heroBackgroundImage: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
              <Field label="Happy Guests">
                <Input
                  value={content.statGuests}
                  onChange={(e) => patch({ statGuests: e.target.value })}
                />
              </Field>
              <Field label="Tours Completed">
                <Input
                  value={content.statTours}
                  onChange={(e) => patch({ statTours: e.target.value })}
                />
              </Field>
              <Field label="Destinations">
                <Input
                  value={content.statDestinations}
                  onChange={(e) => patch({ statDestinations: e.target.value })}
                />
              </Field>
              <Field label="Average Rating">
                <Input
                  value={content.statRating}
                  onChange={(e) => patch({ statRating: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              {content.faq.map((f, i) => (
                <div key={f.id} className="border-border flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">Question {i + 1}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove question"
                      onClick={() => removeFaq(f.id)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                  <Input
                    value={f.question}
                    onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                    placeholder="Question"
                  />
                  <Textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                    placeholder="Answer"
                  />
                </div>
              ))}
              <Button variant="outline" className="w-fit gap-2" onClick={addFaq}>
                <Plus className="size-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Field label="Title">
                <Input
                  value={content.aboutTitle}
                  onChange={(e) => patch({ aboutTitle: e.target.value })}
                />
              </Field>
              <Field label="Body">
                <Textarea
                  rows={5}
                  value={content.aboutBody}
                  onChange={(e) => patch({ aboutBody: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Field label="Address">
                <Textarea
                  value={content.contactAddress}
                  onChange={(e) => patch({ contactAddress: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={content.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={content.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Field label="Description">
                <Textarea
                  value={content.footerDescription}
                  onChange={(e) => patch({ footerDescription: e.target.value })}
                />
              </Field>
              <Field label="Copyright Text">
                <Input
                  value={content.footerCopyright}
                  onChange={(e) => patch({ footerCopyright: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
