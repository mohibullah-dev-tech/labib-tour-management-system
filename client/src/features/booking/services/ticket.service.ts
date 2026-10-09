import { toast } from 'sonner';
import { apiClient, extractApiErrorMessage } from '@/lib/axios';

/**
 * Reads an error message from a Blob response (when responseType: 'blob' is used with Axios).
 */
async function extractBlobErrorMessage(error: unknown, fallback: string): Promise<string> {
  try {
    const err = error as { response?: { data?: unknown } };
    if (err?.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      const parsed = JSON.parse(text);
      if (parsed?.message) return parsed.message;
      if (parsed?.error?.message) return parsed.error.message;
    }
  } catch {
    // If not JSON blob, fall through
  }
  return extractApiErrorMessage(error, fallback);
}

/**
 * Downloads a binary PDF blob by triggering a programmatic anchor click.
 */
function triggerBlobDownload(blobData: Blob, filename: string): void {
  const blob = new Blob([blobData], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after trigger
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

export const ticketService = {
  /**
   * Download official confirmed booking ticket PDF.
   */
  async downloadTicketPdf(bookingId: string, bookingCode?: string): Promise<boolean> {
    const toastId = toast.loading('Preparing your official tour ticket...');
    try {
      const safeId = encodeURIComponent(bookingId);
      const response = await apiClient.get<Blob>(`/bookings/${safeId}/ticket.pdf`, {
        responseType: 'blob',
      });

      const safeCode = (bookingCode || bookingId).replace(/[^A-Za-z0-9_-]/g, '');
      const filename = `ticket-${safeCode}.pdf`;

      triggerBlobDownload(response.data, filename);
      toast.success('Ticket PDF downloaded successfully!', { id: toastId });
      return true;
    } catch (error) {
      const message = await extractBlobErrorMessage(
        error,
        'Failed to download ticket PDF. Please verify your booking status or try again.',
      );
      toast.error(message, { id: toastId });
      return false;
    }
  },

  /**
   * Download booking confirmation / payment receipt PDF.
   */
  async downloadReceiptPdf(bookingId: string, bookingCode?: string): Promise<boolean> {
    const toastId = toast.loading('Generating your booking receipt...');
    try {
      const safeId = encodeURIComponent(bookingId);
      const response = await apiClient.get<Blob>(`/bookings/${safeId}/receipt.pdf`, {
        responseType: 'blob',
      });

      const safeCode = (bookingCode || bookingId).replace(/[^A-Za-z0-9_-]/g, '');
      const filename = `receipt-${safeCode}.pdf`;

      triggerBlobDownload(response.data, filename);
      toast.success('Receipt PDF downloaded successfully!', { id: toastId });
      return true;
    } catch (error) {
      const message = await extractBlobErrorMessage(
        error,
        'Failed to download receipt PDF. Please try again.',
      );
      toast.error(message, { id: toastId });
      return false;
    }
  },
};
