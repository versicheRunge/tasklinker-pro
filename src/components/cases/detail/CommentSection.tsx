
import React, { useState } from 'react';
import { MessageSquare, Phone, StickyNote, Send } from 'lucide-react';
import { CaseActivity, User } from '../../../types/case';
import { Button } from '../../ui/button';
import { CaseActivityTimeline } from '../CaseActivityTimeline';
import { CustomAvatar } from '../../ui/CustomAvatar';
import { MentionInput } from '../../common/MentionInput';

interface CommentSectionProps {
  activities: CaseActivity[];
  currentUser: User | null | undefined;
  caseId: string;
  users: User[];
  onAddComment: (text: string, mentions: string[], type?: string) => void;
}

type EntryType = 'comment' | 'phone' | 'note';

const ENTRY_TYPES: { type: EntryType; icon: React.ReactNode; label: string; placeholder: string; color: string }[] = [
  { type: 'comment', icon: <MessageSquare className="w-4 h-4" />, label: 'Kommentar', placeholder: 'Kommentar schreiben… (@Name für Erwähnung)', color: 'border-primary' },
  { type: 'phone',   icon: <Phone className="w-4 h-4" />,         label: 'Telefonnotiz', placeholder: 'Gesprächsnotiz: Wer hat angerufen? Was wurde besprochen? Nächste Schritte?', color: 'border-green-500' },
  { type: 'note',    icon: <StickyNote className="w-4 h-4" />,    label: 'Interne Notiz', placeholder: 'Interne Notiz (nur für das Team sichtbar)…', color: 'border-amber-500' },
];

export const CommentSection: React.FC<CommentSectionProps> = ({
  activities, currentUser, caseId, users, onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('comment');

  const handlePost = () => {
    if (!commentText.trim()) return;
    const mentions: string[] = [];
    const regex = /@([a-zA-ZäöüÄÖÜß0-9]+)/g;
    let match;
    while ((match = regex.exec(commentText)) !== null) {
      const u = users.find(u => u.name.toLowerCase().includes(match![1].toLowerCase()));
      if (u) mentions.push(u.id);
    }
    onAddComment(commentText, mentions, entryType);
    setCommentText('');
  };

  const current = ENTRY_TYPES.find(t => t.type === entryType)!;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Aktivitäten & Notizen</h3>
      </div>

      <div className="p-6">
        <CaseActivityTimeline activities={activities} />
      </div>

      {currentUser && (
        <div className="p-4 border-t border-border bg-muted/20">
          {/* Typ-Auswahl */}
          <div className="flex gap-1 mb-3">
            {ENTRY_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => setEntryType(t.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  entryType === t.type
                    ? `${t.color} bg-primary/10 text-primary`
                    : 'border-transparent text-muted-foreground hover:bg-muted'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <CustomAvatar name={currentUser.name} imageSrc={currentUser.avatar} size="sm" />
            <div className="flex-1">
              <MentionInput
                value={commentText}
                onChange={setCommentText}
                onMention={() => {}}
                placeholder={current.placeholder}
                multiline={true}
                className={`min-h-[80px] bg-background border focus:ring-1 py-2 ${entryType === 'phone' ? 'focus:ring-green-500' : entryType === 'note' ? 'focus:ring-amber-500' : 'focus:ring-primary'}`}
                users={users}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">{current.icon} {current.label}</span>
                <Button size="sm" className="gap-1.5" onClick={handlePost} disabled={!commentText.trim()}>
                  <Send className="w-4 h-4" /> Speichern
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
