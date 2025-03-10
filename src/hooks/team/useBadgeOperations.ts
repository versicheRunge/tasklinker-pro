
import { useState, useEffect } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { UserBadge } from '../../contexts/UserTypes';
import { toast } from "../use-toast";

export const useBadgeOperations = () => {
  const { updateUser } = useUser();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [userForBadges, setUserForBadges] = useState<User | null>(null);
  const [availableBadges, setAvailableBadges] = useState<UserBadge[]>([]);

  // Aktualisiere verfügbare Badges beim Mount
  useEffect(() => {
    const badges = getAvailableBadges();
    setAvailableBadges(badges);
    
    // Wenn keine Badges vorhanden sind, initialisiere sie
    if (badges.length === 0) {
      const defaultBadges = generateDefaultBadges();
      localStorage.setItem('userBadges', JSON.stringify(defaultBadges));
      setAvailableBadges(defaultBadges);
    }
  }, []);

  const handleOpenBadgeDialog = (user: User) => {
    setUserForBadges(user);
    setIsBadgeDialogOpen(true);
    // Badges neu laden, falls sie aktualisiert wurden
    setAvailableBadges(getAvailableBadges());
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!userForBadges) return;
    
    const updatedBadges = userForBadges.badges || [];
    const badgeIndex = updatedBadges.findIndex(badge => badge.id === badgeId);
    
    if (badgeIndex >= 0) {
      updatedBadges.splice(badgeIndex, 1);
    } else {
      const selectedBadge = availableBadges.find(badge => badge.id === badgeId);
      if (selectedBadge) {
        updatedBadges.push(selectedBadge);
      }
    }
    
    setUserForBadges({
      ...userForBadges,
      badges: updatedBadges
    });
  };

  const handleSaveBadges = () => {
    if (!userForBadges) return;
    
    updateUser(userForBadges.id, { badges: userForBadges.badges });
    setIsBadgeDialogOpen(false);
    
    toast({
      title: "Auszeichnungen aktualisiert",
      description: "Die Auszeichnungen wurden erfolgreich aktualisiert."
    });
  };

  const getAvailableBadges = () => {
    const storedBadges = localStorage.getItem('userBadges');
    if (storedBadges) {
      try {
        const parsedBadges = JSON.parse(storedBadges);
        return parsedBadges && parsedBadges.length > 0 ? parsedBadges : generateDefaultBadges();
      } catch (e) {
        console.error('Error parsing badges:', e);
        return generateDefaultBadges();
      }
    }
    return generateDefaultBadges();
  };

  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

  // Function to generate default badges
  const generateDefaultBadges = (): UserBadge[] => {
    return [
      // Original Achievement badges
      { id: 'badge-1', name: 'Top Performer', icon: '🏆', category: 'achievement' },
      { id: 'badge-2', name: 'Überstunden-Held', icon: '⏱️', category: 'achievement' },
      { id: 'badge-3', name: 'Innovator', icon: '💡', category: 'achievement' },
      { id: 'badge-4', name: 'Team-Player', icon: '🤝', category: 'achievement' },
      { id: 'badge-5', name: 'Kundenservice-Ass', icon: '🌟', category: 'achievement' },
      { id: 'badge-6', name: 'Problemlöser', icon: '🧩', category: 'achievement' },
      { id: 'badge-7', name: 'Effizienz-Champion', icon: '⚡', category: 'achievement' },
      { id: 'badge-8', name: 'Qualitäts-Garant', icon: '✓', category: 'achievement' },
      { id: 'badge-9', name: 'Sonderaufgaben-Meister', icon: '🎯', category: 'achievement' },
      { id: 'badge-10', name: 'Vertriebs-Champion', icon: '📈', category: 'achievement' },
      
      // Original Skill badges
      { id: 'badge-11', name: 'Excel-Profi', icon: '📊', category: 'skill' },
      { id: 'badge-12', name: 'Präsentationstalent', icon: '🎤', category: 'skill' },
      { id: 'badge-13', name: 'Verhandlungsexperte', icon: '🤔', category: 'skill' },
      { id: 'badge-14', name: 'Projektmanagement-Profi', icon: '📋', category: 'skill' },
      { id: 'badge-15', name: 'IT-Experte', icon: '💻', category: 'skill' },
      { id: 'badge-16', name: 'Kommunikationstalent', icon: '💬', category: 'skill' },
      { id: 'badge-17', name: 'Designtalent', icon: '🎨', category: 'skill' },
      { id: 'badge-18', name: 'Fremdsprachenprofi', icon: '🌍', category: 'skill' },
      { id: 'badge-19', name: 'Recherche-Spezialist', icon: '🔍', category: 'skill' },
      { id: 'badge-20', name: 'Strategieexperte', icon: '♟️', category: 'skill' },
      
      // Original Tenure badges
      { id: 'badge-21', name: '1 Jahr Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-22', name: '5 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-23', name: '10 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-24', name: '15 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-25', name: '20 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-26', name: '25 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
      { id: 'badge-27', name: 'Gründungsmitglied', icon: '🏛️', category: 'tenure' },
      { id: 'badge-28', name: 'Senior-Status', icon: '👑', category: 'tenure' },
      { id: 'badge-29', name: 'Mentor', icon: '👨‍🏫', category: 'tenure' },
      { id: 'badge-30', name: 'Veteranenstatus', icon: '🦸', category: 'tenure' },
      
      // Original Certification badges
      { id: 'badge-31', name: 'Business-Zertifizierung', icon: '📜', category: 'certification' },
      { id: 'badge-32', name: 'Technische Zertifizierung', icon: '🔧', category: 'certification' },
      { id: 'badge-33', name: 'Management-Zertifizierung', icon: '👔', category: 'certification' },
      { id: 'badge-34', name: 'Spezialistenzertifizierung', icon: '🎓', category: 'certification' },
      { id: 'badge-35', name: 'Sicherheitsschulung', icon: '🔒', category: 'certification' },
      { id: 'badge-36', name: 'Datenschutzexperte', icon: '🛡️', category: 'certification' },
      { id: 'badge-37', name: 'Versicherungsfachwirt', icon: '📝', category: 'certification' },
      { id: 'badge-38', name: 'Vertriebstraining', icon: '🤝', category: 'certification' },
      { id: 'badge-39', name: 'Führungskräftetraining', icon: '🏅', category: 'certification' },
      { id: 'badge-40', name: 'Compliance-Schulung', icon: '⚖️', category: 'certification' },
      
      // Original Special badges
      { id: 'badge-41', name: 'Ideengeber', icon: '💭', category: 'special' },
      { id: 'badge-42', name: 'Soziales Engagement', icon: '❤️', category: 'special' },
      { id: 'badge-43', name: 'Umweltbewusstsein', icon: '🌱', category: 'special' },
      { id: 'badge-44', name: 'Beste Teamarbeit', icon: '👥', category: 'special' },
      { id: 'badge-45', name: 'Besondere Leistung', icon: '🌠', category: 'special' },
      { id: 'badge-46', name: 'Führungskompetenz', icon: '🚩', category: 'special' },
      { id: 'badge-47', name: 'Außergewöhnlicher Einsatz', icon: '🔥', category: 'special' },
      { id: 'badge-48', name: 'Bestes Feedback', icon: '👍', category: 'special' },
      { id: 'badge-49', name: 'Innovationspreis', icon: '🚀', category: 'special' },
      { id: 'badge-50', name: 'Mitarbeiter des Jahres', icon: '👑', category: 'special' },

      // New Achievement badges
      { id: 'badge-51', name: 'Produktivitätschampion', icon: '⚙️', category: 'achievement' },
      { id: 'badge-52', name: 'Umsatzrekord', icon: '💰', category: 'achievement' },
      { id: 'badge-53', name: 'Kundenakquise-Experte', icon: '🤵', category: 'achievement' },
      { id: 'badge-54', name: 'Kundenbindungsmeister', icon: '🔄', category: 'achievement' },
      { id: 'badge-55', name: 'Kostenoptimierer', icon: '📉', category: 'achievement' },
      
      // New Skill badges
      { id: 'badge-56', name: 'Datenanalyse-Experte', icon: '📊', category: 'skill' },
      { id: 'badge-57', name: 'Content-Creation', icon: '✍️', category: 'skill' },
      { id: 'badge-58', name: 'Change-Management', icon: '🔄', category: 'skill' },
      { id: 'badge-59', name: 'Agile-Coach', icon: '🏃', category: 'skill' },
      { id: 'badge-60', name: 'UX-Design', icon: '🖌️', category: 'skill' },

      // New Tenure badges
      { id: 'badge-61', name: '30 Jahre Betriebszugehörigkeit', icon: '🎖️', category: 'tenure' },
      { id: 'badge-62', name: 'Firmenerbe', icon: '🏛️', category: 'tenure' },
      { id: 'badge-63', name: 'Treuer Begleiter', icon: '🔗', category: 'tenure' },
      
      // New Certification badges
      { id: 'badge-64', name: 'ISO-Zertifizierung', icon: '📋', category: 'certification' },
      { id: 'badge-65', name: 'Digital Marketing', icon: '📱', category: 'certification' },
      { id: 'badge-66', name: 'Projektmanagement', icon: '📅', category: 'certification' },
      { id: 'badge-67', name: 'Software-Entwicklung', icon: '👨‍💻', category: 'certification' },
      { id: 'badge-68', name: 'Leadership-Training', icon: '👩‍💼', category: 'certification' },
      
      // New Special badges
      { id: 'badge-69', name: 'Krisenmanager', icon: '🧯', category: 'special' },
      { id: 'badge-70', name: 'Inklusions-Champion', icon: '♿', category: 'special' },
      { id: 'badge-71', name: 'Diversitätsbeauftragter', icon: '🌈', category: 'special' },
      { id: 'badge-72', name: 'Querdenker', icon: '🧠', category: 'special' },
      { id: 'badge-73', name: 'Change-Maker', icon: '🦋', category: 'special' },
      { id: 'badge-74', name: 'Digitaler Pionier', icon: '🔌', category: 'special' },
      { id: 'badge-75', name: 'Nachhaltigkeits-Botschafter', icon: '🌿', category: 'special' }
    ];
  };

  return {
    isBadgeDialogOpen,
    setIsBadgeDialogOpen,
    userForBadges,
    badgeCategories,
    availableBadges,
    handleOpenBadgeDialog,
    handleToggleBadge,
    handleSaveBadges
  };
};
