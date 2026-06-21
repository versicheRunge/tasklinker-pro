
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlusCircle } from 'lucide-react';
import { Dialog } from "../components/ui/dialog";
import { TeamMemberCard } from '../components/team/TeamMemberCard';
import { AddUserDialog } from '../components/team/AddUserDialog';
import { EditUserDialog } from '../components/team/EditUserDialog';
import { AvatarDialog } from '../components/team/AvatarDialog';
import { BadgeManagementDialog } from '../components/team/BadgeManagementDialog';
import { VacationAllowanceDialog } from '../components/team/VacationAllowanceDialog';
import { AbsenceStatsTable } from '../components/team/AbsenceStatsTable';
import { VacationRequestsAdmin } from '../components/team/VacationRequestsAdmin';
import { useTeamManager } from '../hooks/useTeamManager';

const Team: React.FC = () => {
  const {
    users,
    currentUser,
    isAdmin,
    calendarEvents,
    isDialogOpen,
    setIsDialogOpen,
    isEditingDialogOpen,
    setIsEditingDialogOpen,
    newUser,
    setNewUser,
    editingUser,
    setEditingUser,
    avatarUrl,
    setAvatarUrl,
    isAvatarDialogOpen,
    setIsAvatarDialogOpen,
    userToChangeAvatar,
    isBadgeDialogOpen,
    setIsBadgeDialogOpen,
    userForBadges,
    isVacationDialogOpen,
    setIsVacationDialogOpen,
    userForVacation,
    badgeCategories,
    availableBadges,
    handleAddUser,
    handleDeleteUser,
    handleEditUser,
    handleSaveUser,
    handleOpenAvatarDialog,
    handleSaveAvatar,
    handleOpenBadgeDialog,
    handleToggleBadge,
    handleSaveBadges,
    handleOpenVacationDialog,
    handleSaveVacation,
    generateRandomAvatar
  } = useTeamManager();

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Verwalten Sie Ihr Team und deren Berechtigungen." 
              : "Das ist unser großartiges Team!"}
          </p>
        </div>
        {isAdmin && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neuer Benutzer</span>
          </button>
        )}
      </div>
      
      {/* Admin Only: Vacation Requests */}
      {isAdmin && <VacationRequestsAdmin />}

      {/* Admin Only: Absence Statistics */}
      {isAdmin && (
        <AbsenceStatsTable
          users={users}
          events={calendarEvents}
          isAdmin={isAdmin}
          onEditAllowance={handleOpenVacationDialog}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <TeamMemberCard
            key={user.id}
            user={user}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAvatarChange={handleOpenAvatarDialog}
            onManageBadges={handleOpenBadgeDialog}
            onManageVacation={isAdmin ? handleOpenVacationDialog : undefined}
          />
        ))}
      </div>
      
      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AddUserDialog
          newUser={newUser}
          setNewUser={setNewUser}
          onCancel={() => setIsDialogOpen(false)}
          onAddUser={handleAddUser}
        />
      </Dialog>
      
      <Dialog open={isEditingDialogOpen} onOpenChange={setIsEditingDialogOpen}>
        <EditUserDialog
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          currentUserId={currentUser?.id}
          onCancel={() => setIsEditingDialogOpen(false)}
          onSave={handleSaveUser}
        />
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <AvatarDialog
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          onCancel={() => setIsAvatarDialogOpen(false)}
          onSave={handleSaveAvatar}
          onGenerateRandom={generateRandomAvatar}
        />
      </Dialog>

      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <BadgeManagementDialog
          user={userForBadges}
          badgeCategories={badgeCategories}
          availableBadges={availableBadges}
          onToggleBadge={handleToggleBadge}
          onCancel={() => setIsBadgeDialogOpen(false)}
          onSave={handleSaveBadges}
        />
      </Dialog>
      
      <Dialog open={isVacationDialogOpen} onOpenChange={setIsVacationDialogOpen}>
        {userForVacation && (
          <VacationAllowanceDialog
            user={userForVacation}
            onClose={() => setIsVacationDialogOpen(false)}
            onSave={handleSaveVacation}
          />
        )}
      </Dialog>
    </AppLayout>
  );
};

export default Team;
