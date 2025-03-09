
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { CaseActivity, User } from '../../../types/case';
import { Button } from '../../ui/button';
import { CaseActivityTimeline } from '../CaseActivityTimeline';
import { CustomAvatar } from '../../ui/CustomAvatar';

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
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Filter users for @ mentions
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(mentionSearch.toLowerCase()))
  );

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

  // Handle input changes in comment field and detect @ mentions
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);
    
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);
    
    // Find position of last @ before cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const mentionText = textBeforeCursor.substring(lastAtPos + 1);
      const wordAfterAt = mentionText.match(/^\S*/)?.[0] || '';
      
      // Check if a complete word follows or we're at the end of text
      const isCompleteWord = 
        cursorPos === text.length || 
        text[cursorPos] === ' ' ||
        mentionText.includes(' ');
      
      if (!isCompleteWord && lastAtPos !== cursorPos - 1) {
        setMentionSearch(wordAfterAt);
        setShowMentions(true);
        
        // Calculate position for dropdown
        if (commentRef.current) {
          const cursorCoords = getCaretCoordinates(commentRef.current, cursorPos);
          setMentionPosition({
            top: cursorCoords.top + 20,
            left: cursorCoords.left
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Helper function to determine cursor position in textarea
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const { offsetLeft, offsetTop } = element;
    const div = document.createElement('div');
    const styles = getComputedStyle(element);
    
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.visibility = 'hidden';
    div.style.width = styles.width;
    div.style.height = 'auto';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.paddingTop = styles.paddingTop;
    div.style.paddingRight = styles.paddingRight;
    div.style.paddingBottom = styles.paddingBottom;
    div.style.paddingLeft = styles.paddingLeft;
    div.style.fontSize = styles.fontSize;
    div.style.fontFamily = styles.fontFamily;
    div.style.lineHeight = styles.lineHeight;
    
    const text = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    
    document.body.appendChild(div);
    const { offsetTop: spanTop, offsetLeft: spanLeft } = span;
    document.body.removeChild(div);
    
    return {
      top: offsetTop + spanTop,
      left: offsetLeft + spanLeft
    };
  };

  // Insert selected username
  const insertMention = (user: User) => {
    const textBeforeCursor = commentText.substring(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const textBeforeAt = commentText.substring(0, lastAtPos);
      const textAfterCursor = commentText.substring(cursorPosition);
      
      // Create new text with inserted username
      const newText = textBeforeAt + '@' + user.name.replace(/\s+/g, '') + ' ' + textAfterCursor;
      setCommentText(newText);
      
      // Set cursor after inserted username
      setTimeout(() => {
        if (commentRef.current) {
          const newCursorPos = lastAtPos + user.name.replace(/\s+/g, '').length + 2; // +2 for @ and space
          commentRef.current.focus();
          commentRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    
    setShowMentions(false);
  };

  // Close mention list when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMentions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
              <textarea
                ref={commentRef}
                className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none min-h-[80px]"
                placeholder="Schreiben Sie einen Kommentar... (@Benutzer für Erwähnung)"
                value={commentText}
                onChange={handleCommentInputChange}
              />
              
              {showMentions && filteredUsers.length > 0 && (
                <div 
                  className="absolute z-10 bg-background border border-border rounded-md shadow-md w-64 max-h-48 overflow-y-auto" 
                  style={{ 
                    top: mentionPosition.top, 
                    left: mentionPosition.left 
                  }}
                >
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                      onClick={() => insertMention(user)}
                    >
                      <CustomAvatar name={user.name} imageSrc={user.avatar} size="xs" />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
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
