
import { useState } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { toast } from "../use-toast";

export const useAvatarOperations = () => {
  const { updateUser } = useUser();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [userToChangeAvatar, setUserToChangeAvatar] = useState<User | null>(null);

  const handleOpenAvatarDialog = (user: User) => {
    setUserToChangeAvatar(user);
    setAvatarUrl(user.avatar || '');
    setIsAvatarDialogOpen(true);
  };

  const handleSaveAvatar = () => {
    if (!userToChangeAvatar) return;
    
    updateUser(userToChangeAvatar.id, { avatar: avatarUrl });
    setIsAvatarDialogOpen(false);
    setUserToChangeAvatar(null);
    
    toast({
      title: "Avatar aktualisiert",
      description: "Das Profilbild wurde erfolgreich aktualisiert."
    });
  };

  const generateRandomAvatar = () => {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const number = Math.floor(Math.random() * 100);
    const url = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
    setAvatarUrl(url);
  };

  return {
    avatarUrl,
    setAvatarUrl,
    isAvatarDialogOpen,
    setIsAvatarDialogOpen,
    userToChangeAvatar,
    handleOpenAvatarDialog,
    handleSaveAvatar,
    generateRandomAvatar
  };
};
