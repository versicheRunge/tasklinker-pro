
import React from 'react';
import { User } from '../../../types/case';

interface UserSelectorProps {
  userId?: string;
  onUserChange: (userId: string) => void;
  users: User[];
  disabled?: boolean;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  userId,
  onUserChange,
  users,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Mitarbeiter
      </label>
      <select
        className="w-full px-3 py-2 border border-input rounded-md"
        value={userId || ''}
        onChange={(e) => onUserChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>Mitarbeiter auswählen</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};
