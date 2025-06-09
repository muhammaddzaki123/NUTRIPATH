import { Nutritionist } from '../constants/chat';

export interface Notification {
  $id: string;
  userId: string;
  type: 'chat' | 'article' | 'recall';
  title: string;
  description: string;
  timestamp: string;
  read?: boolean;
  data?: {
    chatId?: string;
    articleId?: string;
    nutritionistId?: string;
  };
}

export interface NotificationParams {
  unreadMessages: { [key: string]: number };
  nutritionists: Nutritionist[];
}

export interface NotificationItemProps {
  id: string;
  type: 'chat' | 'article' | 'recall';
  title: string;
  description: string;
  timestamp: string;
  onPress: () => void;
}
