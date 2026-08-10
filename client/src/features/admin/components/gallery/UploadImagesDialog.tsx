import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface UploadImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * UI-only upload flow — no real file upload happens (no backend/storage
 * exists yet). Accepts a file selection so the interaction feels real,
 * then confirms via toast. Real uploads will go through Cloudinary
 * (already the project's chosen image host) once the Gallery API exists.
 */
function UploadImagesDialog({ open, onOpenChange }: UploadImagesDialogProps) {
  const [destination, setDestination] = useState('');
  const [fileCount, setFileCount] = useState(0);

  const handleUpload = () => {
    toast.success(
      fileCount > 0
        ? `${fileCount} image(s) queued for upload to ${destination || 'Gallery'}`
        : 'Select at least one file first',
    );
    onOpenChange(false);
    setFileCount(0);
    setDestination('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gallery-destination">Destination</Label>
            <Input
              id="gallery-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Sajek Valley"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gallery-files">Images</Label>
            <label
              htmlFor="gallery-files"
              className="border-border text-muted-foreground hover:border-primary hover:text-primary flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-center text-sm"
            >
              <Upload className="size-6" aria-hidden="true" />
              {fileCount > 0 ? `${fileCount} file(s) selected` : 'Click to choose images'}
              <input
                id="gallery-files"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { UploadImagesDialog };
