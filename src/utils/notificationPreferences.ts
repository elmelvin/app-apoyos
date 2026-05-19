export type NotificationPreferences = {
  app: boolean;
  email: boolean;
  reminders: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  app: false,
  email: true,
  reminders: true,
};

export const getNotificationPreferencesKey = (userId: string) =>
  `app-apoyos:notification-preferences:${userId}`;

export const getNotificationInboxKey = (userId: string) =>
  `app-apoyos:notification-inbox:${userId}`;

export const getNotificationSnapshotKey = (userId: string) =>
  `app-apoyos:notification-snapshot:${userId}`;
