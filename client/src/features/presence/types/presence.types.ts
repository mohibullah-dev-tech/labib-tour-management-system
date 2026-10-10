export interface ActiveUserPresence {
  socketId: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  isVisitor: boolean;
  currentPath?: string;
  pageTitle?: string;
  device?: string;
  connectedAt: string;
  lastActiveAt: string;
  status: 'active' | 'idle';
}

export interface PresenceSummary {
  totalOnline: number;
  guestsCount: number;
  hostsCount: number;
  adminsCount: number;
  visitorsCount: number;
}

export interface ActiveUsersResponse {
  items: ActiveUserPresence[];
  summary: PresenceSummary;
}
