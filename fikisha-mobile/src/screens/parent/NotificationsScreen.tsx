import React from 'react';
import { NotificationsList } from '@/components/NotificationsList';

interface NotificationsScreenProps {
  onBack: () => void;
}

export function ParentNotificationsScreen({ onBack }: NotificationsScreenProps) {
  return <NotificationsList onBack={onBack} />;
}
