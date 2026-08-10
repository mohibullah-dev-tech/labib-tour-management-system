import { useEffect, useState } from 'react';
import type { TourTemplate, TemplateStatus } from '@/features/admin/types';
import { TOUR_CATEGORY_LABELS, type TourCategory } from '@/features/tours/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/features/admin/components/shared/TagInput';

export interface TemplateFormValues {
  name: string;
  destination: string;
  category: TourCategory;
  durationDays: number;
  durationNights: number;
  status: TemplateStatus;
  coverImage: string;
  includes: string[];
  excludes: string[];
  places: string[];
}

export interface TemplateFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: TourTemplate | null;
  onSave: (values: TemplateFormValues) => void;
}

const EMPTY_VALUES: TemplateFormValues = {
  name: '',
  destination: '',
  category: 'relax',
  durationDays: 1,
  durationNights: 0,
  status: 'draft',
  coverImage: '',
  includes: [],
  excludes: [],
  places: [],
};

/**
 * Create/Edit form for a Tour Template. Food Menu, Travel Timeline, and
 * Gallery — the brief's deeper nested sections — are summarized as
 * counts on the template list (see AdminToursPage) rather than fully
 * editable here; each is realistically its own sub-editor (similar in
 * scope to the Tour Details page's FoodMenu/TravelTimeline components)
 * and is a natural next increment once this template list is connected
 * to a backend that needs them populated.
 */
function TemplateFormSheet({
  open,
  onOpenChange,
  editingTemplate,
  onSave,
}: TemplateFormSheetProps) {
  const [values, setValues] = useState<TemplateFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (editingTemplate) {
      setValues({
        name: editingTemplate.name,
        destination: editingTemplate.destination,
        category: editingTemplate.category,
        durationDays: editingTemplate.durationDays,
        durationNights: editingTemplate.durationNights,
        status: editingTemplate.status,
        coverImage: editingTemplate.coverImage,
        includes: [],
        excludes: [],
        places: [],
      });
    } else if (open) {
      setValues(EMPTY_VALUES);
    }
  }, [editingTemplate, open]);

  const handleSubmit = () => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingTemplate ? 'Edit Tour Template' : 'New Tour Template'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input
              id="tpl-name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="e.g. Sajek Relax Tour"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-destination">Destination</Label>
            <Input
              id="tpl-destination"
              value={values.destination}
              onChange={(e) => setValues((v) => ({ ...v, destination: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-category">Category</Label>
              <Select
                value={values.category}
                onValueChange={(val) => setValues((v) => ({ ...v, category: val as TourCategory }))}
              >
                <SelectTrigger id="tpl-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TOUR_CATEGORY_LABELS) as TourCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {TOUR_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(val) => setValues((v) => ({ ...v, status: val as TemplateStatus }))}
              >
                <SelectTrigger id="tpl-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-days">Duration (Days)</Label>
              <Input
                id="tpl-days"
                type="number"
                min={1}
                value={values.durationDays}
                onChange={(e) => setValues((v) => ({ ...v, durationDays: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-nights">Duration (Nights)</Label>
              <Input
                id="tpl-nights"
                type="number"
                min={0}
                value={values.durationNights}
                onChange={(e) =>
                  setValues((v) => ({ ...v, durationNights: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-cover">Cover Image URL</Label>
            <Input
              id="tpl-cover"
              value={values.coverImage}
              onChange={(e) => setValues((v) => ({ ...v, coverImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tour Includes</Label>
            <TagInput
              value={values.includes}
              onChange={(includes) => setValues((v) => ({ ...v, includes }))}
              placeholder="e.g. Bus fare"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tour Excludes</Label>
            <TagInput
              value={values.excludes}
              onChange={(excludes) => setValues((v) => ({ ...v, excludes }))}
              placeholder="e.g. Lunch"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Places to Visit</Label>
            <TagInput
              value={values.places}
              onChange={(places) => setValues((v) => ({ ...v, places }))}
              placeholder="e.g. Congkong Para Viewpoint"
            />
          </div>

          <p className="border-border bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
            Food Menu, Travel Timeline, and Gallery are managed as their own sub-editors once this
            template connects to a backend — not included in this form.
          </p>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!values.name || !values.destination}>
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { TemplateFormSheet };
