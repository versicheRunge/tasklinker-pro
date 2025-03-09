
import { useState, useEffect } from 'react';
import { Notification } from '../types/chat';
import { User } from '../types/case';
import { toast } from "./use-toast";

export function useNotifications(currentUser: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications for current user
  useEffect(() => {
    if (currentUser) {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        try {
          const allNotifications = JSON.parse(storedNotifications);
          const userNotifications = allNotifications[currentUser.id] || [];
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error parsing notifications:', error);
          setNotifications([]);
        }
      }
    }
  }, [currentUser]);
  
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!currentUser) return;
    
    const newNotification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    try {
      const storedNotifications = localStorage.getItem('notifications') || '{}';
      const allNotifications = JSON.parse(storedNotifications);
      
      const userId = notificationData.targetUserId || currentUser.id;
      const userNotifications = allNotifications[userId] || [];
      allNotifications[userId] = [newNotification, ...userNotifications];
      
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
      
      if (userId === currentUser.id) {
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const userNotifications = allNotifications[currentUser.id] || [];
        
        const updatedUserNotifications = userNotifications.map((notification: Notification) => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        );
        
        allNotifications[currentUser.id] = updatedUserNotifications;
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications(updatedUserNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markNotificationsAsRead = (notificationIds: string[]) => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const userNotifications = allNotifications[currentUser.id] || [];
        
        const updatedUserNotifications = userNotifications.map((notification: Notification) => 
          notificationIds.includes(notification.id) ? { ...notification, read: true } : notification
        );
        
        allNotifications[currentUser.id] = updatedUserNotifications;
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications(updatedUserNotifications);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const clearNotifications = () => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        allNotifications[currentUser.id] = [];
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  const mentionUser = (userId: string, caseId: string, message: string, type: 'chat' | 'case' | 'system' = 'case') => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications') || '{}';
      const allNotifications = JSON.parse(storedNotifications);
      
      // Get user information
      const storedUsers = localStorage.getItem('users');
      if (!storedUsers) return;
      
      const users = JSON.parse(storedUsers);
      const mentionedUser = users.find((user: any) => user.id === userId);
      
      if (!mentionedUser) {
        console.log(`User with ID ${userId} not found for mention`);
        return;
      }
      
      const notification: Notification = {
        id: `notification-${Date.now()}`,
        title: `Erwähnung in einem Kommentar`,
        message: `${currentUser.name} hat Sie in einem Kommentar erwähnt: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        timestamp: new Date().toISOString(),
        read: false,
        caseId,
        targetUserId: userId,
        type
      };
      
      const userNotifications = allNotifications[userId] || [];
      allNotifications[userId] = [notification, ...userNotifications];
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
      
      console.log(`Benachrichtigung an ${mentionedUser.name} für Erwähnung in Vorgang ${caseId} gesendet`);
      
      toast({
        title: "Benutzer erwähnt",
        description: `${mentionedUser.name} wurde in Ihrem Kommentar erwähnt und benachrichtigt.`
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  };
  
  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    markNotificationsAsRead,
    clearNotifications,
    mentionUser
  };
}
