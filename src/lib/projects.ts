// Re-export db helpers for convenience
export { getContractors, getSuppliers } from './db';


export type ProjectStatus = 'assembling' | 'brief_sent' | 'active' | 'completed';
export type MemberStatus = 'pending' | 'accepted' | 'declined';
export type MemberType = 'contractor' | 'supplier';
export type NotifType = 'accepted' | 'declined' | 'message' | 'project_ready' | 'replacement_needed';

export interface ScopeItem {
  id: string;
  service: string;
  covered: boolean;
  coveredBy: { type: MemberType; id: string; name: string } | null;
}

export interface TeamMember {
  type: MemberType;
  profileId: string;
  name: string;
  scopesCovered: string[];
  status: MemberStatus;
  invitedAt: number;
  respondedAt: number | null;
}

export interface Message {
  senderId: string;
  senderName: string;
  senderType: string;
  text: string;
  timestamp: number;
}

export interface Thread {
  id: string;
  scope: string;
  participants: { type: string; id: string; name: string }[];
  messages: Message[];
}

export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  budget: string;
  description: string;
  status: ProjectStatus;
  createdAt: number;
  scopeItems: ScopeItem[];
  team: TeamMember[];
  threads: Thread[];
}

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  type: NotifType;
  fromName: string;
  fromType: string;
  scope: string | null;
  read: boolean;
  timestamp: number;
  declinedScope: string | null;
}

// ─── UUID helper ──────────────────────────────────────────────────────────────
export const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

// ─── Projects ─────────────────────────────────────────────────────────────────
const PROJECTS_KEY = 'buildlink_projects';

export const getProjects = (): Project[] => {
  const saved = localStorage.getItem(PROJECTS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getProject = (id: string): Project | undefined =>
  getProjects().find((p) => p.id === id);

export const createProject = (data: {
  name: string;
  type: string;
  location: string;
  budget: string;
  description: string;
  scopeServices: string[];
}): Project => {
  const project: Project = {
    id: uuid(),
    name: data.name,
    type: data.type,
    location: data.location,
    budget: data.budget,
    description: data.description,
    status: 'assembling',
    createdAt: Date.now(),
    scopeItems: data.scopeServices.map((s) => ({
      id: uuid(),
      service: s,
      covered: false,
      coveredBy: null,
    })),
    team: [],
    threads: [],
  };
  const projects = getProjects();
  saveProjects([...projects, project]);
  return project;
};

export const updateProject = (updated: Project) => {
  const projects = getProjects().map((p) => (p.id === updated.id ? updated : p));
  saveProjects(projects);
};

export const addTeamMember = (
  projectId: string,
  member: Omit<TeamMember, 'invitedAt' | 'respondedAt' | 'status'>,
  scopeIds: string[]
): Project | null => {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return null;

  const project = { ...projects[idx] };

  // Mark scopes covered
  project.scopeItems = project.scopeItems.map((si) => {
    if (member.scopesCovered.includes(si.service)) {
      return { ...si, covered: true, coveredBy: { type: member.type, id: member.profileId, name: member.name } };
    }
    return si;
  });

  // Add team member
  const newMember: TeamMember = {
    ...member,
    status: 'pending',
    invitedAt: Date.now(),
    respondedAt: null,
  };
  project.team = [...project.team.filter((m) => m.profileId !== member.profileId), newMember];

  // Create thread for each scope
  const existingThreadScopes = project.threads.map((t) => t.scope);
  const newThreads: Thread[] = member.scopesCovered
    .filter((s) => !existingThreadScopes.includes(s))
    .map((s) => ({
      id: uuid(),
      scope: s,
      participants: [{ type: member.type, id: member.profileId, name: member.name }],
      messages: [],
    }));

  project.threads = [...project.threads, ...newThreads];

  projects[idx] = project;
  saveProjects(projects);
  return project;
};

export const removeTeamMember = (projectId: string, profileId: string): Project | null => {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return null;

  const project = { ...projects[idx] };
  const member = project.team.find((m) => m.profileId === profileId);
  if (!member) return null;

  // Uncover scopes
  project.scopeItems = project.scopeItems.map((si) => {
    if (si.coveredBy?.id === profileId) {
      return { ...si, covered: false, coveredBy: null };
    }
    return si;
  });

  project.team = project.team.filter((m) => m.profileId !== profileId);
  projects[idx] = project;
  saveProjects(projects);
  return project;
};

export const sendProjectBrief = (projectId: string): Project | null => {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], status: 'brief_sent' };
  saveProjects(projects);
  return projects[idx];
};

export const addMessageToThread = (
  projectId: string,
  threadId: string,
  message: Omit<Message, 'timestamp'>
) => {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return;

  const threadIdx = projects[idx].threads.findIndex((t) => t.id === threadId);
  if (threadIdx === -1) return;

  const msg: Message = { ...message, timestamp: Date.now() };
  projects[idx].threads[threadIdx].messages = [...projects[idx].threads[threadIdx].messages, msg];
  saveProjects(projects);
};

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIF_KEY = 'buildlink_notifications';

export const getNotifications = (): Notification[] => {
  const saved = localStorage.getItem(NOTIF_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveNotifications = (notifs: Notification[]) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
};

export const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const notifs = getNotifications();
  const newNotif: Notification = { ...notif, id: uuid(), timestamp: Date.now(), read: false };
  saveNotifications([newNotif, ...notifs]);
  return newNotif;
};

export const markNotificationRead = (id: string) => {
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(notifs);
};

export const markAllRead = () => {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifs);
};

export const getUnreadCount = () => getNotifications().filter((n) => !n.read).length;

export const clearAllData = () => {
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(NOTIF_KEY);
  localStorage.removeItem('buildlink_contractors');
  localStorage.removeItem('buildlink_suppliers');
  localStorage.removeItem('buildlink_homeowner_projects');
  window.dispatchEvent(new Event('buildlink_notif_update'));
};
