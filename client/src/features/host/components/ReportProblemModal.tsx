import { useState } from 'react';
import { AlertOctagon, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReportProblemMutation } from '@/features/host/hooks/useHostData';

interface ReportProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
  tourName?: string;
}

export function ReportProblemModal({
  open,
  onOpenChange,
  eventId,
  tourName,
}: ReportProblemModalProps) {
  const [category, setCategory] = useState<
    'breakdown' | 'medical' | 'weather' | 'route_block' | 'other'
  >('breakdown');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useReportProblemMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both summary title and detailed incident description.');
      return;
    }

    reportMutation.mutate(
      { eventId, category, urgency, title, description },
      {
        onSuccess: (data) => {
          toast.success(`Incident Dispatch Created #${data.reportId}`, {
            description: 'Central operations and local ground emergency staff have been alerted.',
          });
          onOpenChange(false);
          setTitle('');
          setDescription('');
        },
        onError: () => {
          toast.error('Failed to submit report. Please dial emergency SOS directly.');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
            <AlertOctagon className="size-6" />
          </div>
          <DialogTitle className="font-display text-xl">
            Report Field Incident / Problem
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Dispatches high-priority alert directly to LTMS Operations Desk and Fleet Coordinator
            for <strong className="text-foreground">{tourName ?? 'Current Tour'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Incident Type</Label>
              <Select
                value={category}
                onValueChange={(
                  val: 'breakdown' | 'medical' | 'weather' | 'route_block' | 'other',
                ) => setCategory(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakdown">Bus Mechanical Failure</SelectItem>
                  <SelectItem value="medical">Guest Medical Emergency</SelectItem>
                  <SelectItem value="weather">Severe Weather / Landslide</SelectItem>
                  <SelectItem value="route_block">Highway Road Blockage</SelectItem>
                  <SelectItem value="other">Other Field Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Urgency Level</Label>
              <Select
                value={urgency}
                onValueChange={(val: 'low' | 'medium' | 'high' | 'critical') => setUrgency(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Informational</SelectItem>
                  <SelectItem value="medium">Medium - Manageable</SelectItem>
                  <SelectItem value="high">High - Needs Dispatch</SelectItem>
                  <SelectItem value="critical">Critical - Immediate SOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="incident-title" className="text-xs font-semibold">
              Brief Summary Title
            </Label>
            <Input
              id="incident-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Radiator leak near Cumilla highway bypass"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="incident-desc" className="text-xs font-semibold">
              Situation Description &amp; Passenger Safety Status
            </Label>
            <Textarea
              id="incident-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify current vehicle location, estimated delay, driver actions taken, and guest status..."
              rows={4}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="gap-2"
              isLoading={reportMutation.isPending}
            >
              <Send className="size-3.5" />
              <span>Submit Incident Report</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
