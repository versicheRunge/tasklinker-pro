
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
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
  onAddComment: (text: string, mentions: string[]) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  activities,
  currentUser,
  caseId,
  users,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  
  // Handle posting a comment
  const handlePostComment = () => {
    if (!commentText.trim()) return;
    
    // Extract mentions from comment text
    const mentions: string[] = [];
    const regex = /@([a-zA-Z0-9]+)/g;
    let match;
    
    while ((match = regex.exec(commentText)) !== null) {
      const mentionedUsername = match[1];
      const mentionedUser = users.find(u => 
        u.name.replace(/\s+/g, '').toLowerCase() === mentionedUsername.toLowerCase()
      );
      
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    onAddComment(commentText, mentions);
    setCommentText('');
  };

  // Extract user ID from @mention
  const handleMention = (userId: string, text: string) => {
    console.log('Benutzer erwähnt:', userId);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Aktivitäten & Kommentare</h3>
      </div>
      
      <div className="p-6">
        <CaseActivityTimeline activities={activities} />
      </div>
      
      {currentUser && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-3">
            <div>
              <CustomAvatar 
                name={currentUser.name} 
                imageSrc={currentUser.avatar} 
                size="sm" 
              />
            </div>
            
            <div className="flex-1 relative">
              <MentionInput
                value={commentText}
                onChange={setCommentText}
                onMention={handleMention}
                placeholder="Schreiben Sie einen Kommentar... (@Benutzer für Erwähnung)"
                multiline={true}
                className="min-h-[80px] bg-background border focus:ring-1 focus:ring-primary py-2"
              />
              
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  className="gap-1.5"
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-4 h-4" /> Senden
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
