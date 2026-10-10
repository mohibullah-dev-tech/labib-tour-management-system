import type { Request, Response } from 'express';
import { presenceService } from './presence.service.js';

export class PresenceController {
  /**
   * Public summary of real-time presence (active travelers/visitors count).
   */
  static getSummary(_req: Request, res: Response): void {
    const summary = presenceService.getSummary();
    res.json({
      success: true,
      data: summary,
    });
  }

  /**
   * Admin-only detailed list of currently active users and their pages.
   */
  static getActiveUsers(_req: Request, res: Response): void {
    const items = presenceService.getRoster();
    const summary = presenceService.getSummary();

    res.json({
      success: true,
      data: {
        items,
        summary,
      },
    });
  }
}

