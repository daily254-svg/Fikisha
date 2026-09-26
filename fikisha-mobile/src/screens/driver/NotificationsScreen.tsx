import React from 'react';
import { NotificationsList } from '@/components/NotificationsList';

interface NotificationsScreenProps {
  onBack: () => void;
}

export function DriverNotificationsScreen({ onBack }: NotificationsScreenProps) {
  return <NotificationsList onBack={onBack} />;
}
