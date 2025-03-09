
import React from 'react';
import { Filter, Users } from 'lucide-react';
import { CasePriority } from '../../types/case';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { User } from '../../types/case';

interface CaseFiltersProps {
  filterPriority: CasePriority | 'all';
  setFilterPriority: (priority: CasePriority | 'all') => void;
  filterUserId: string | 'all';
  setFilterUserId: (userId: string | 'all') => void;
  users: User[];
  isFilterPriorityOpen: boolean;
  setIsFilterPriorityOpen: (isOpen: boolean) => void;
  isFilterUserOpen: boolean;
  setIsFilterUserOpen: (isOpen: boolean) => void;
}

export const CaseFilters: React.FC<CaseFiltersProps> = ({
  filterPriority,
  setFilterPriority,
  filterUserId,
  setFilterUserId,
  users,
  isFilterPriorityOpen,
  setIsFilterPriorityOpen,
  isFilterUserOpen,
  setIsFilterUserOpen
}) => {
  return (
    <div className="flex items-center gap-2">
      <Popover open={isFilterPriorityOpen} onOpenChange={setIsFilterPriorityOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Priorität filtern</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            <h4 className="font-medium mb-2">Nach Priorität filtern</h4>
            <div className="flex flex-col gap-2">
              <button 
                className={`px-3 py-2 rounded-md ${filterPriority === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterPriority('all')}
              >
                Alle Prioritäten
              </button>
              <button 
                className={`px-3 py-2 rounded-md ${filterPriority === 'low' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterPriority('low')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Niedrig
                </div>
              </button>
              <button 
                className={`px-3 py-2 rounded-md ${filterPriority === 'medium' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterPriority('medium')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Mittel
                </div>
              </button>
              <button 
                className={`px-3 py-2 rounded-md ${filterPriority === 'high' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterPriority('high')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Hoch
                </div>
              </button>
              <button 
                className={`px-3 py-2 rounded-md ${filterPriority === 'urgent' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterPriority('urgent')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Dringend
                </div>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover open={isFilterUserOpen} onOpenChange={setIsFilterUserOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Mitarbeiter filtern</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-medium mb-2">Nach Mitarbeiter filtern</h4>
            <div className="flex flex-col gap-2">
              <button 
                className={`px-3 py-2 rounded-md ${filterUserId === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setFilterUserId('all')}
              >
                Alle Mitarbeiter
              </button>
              {users.map(user => (
                <button 
                  key={user.id}
                  className={`px-3 py-2 rounded-md flex items-center gap-2 ${filterUserId === user.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setFilterUserId(user.id)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
