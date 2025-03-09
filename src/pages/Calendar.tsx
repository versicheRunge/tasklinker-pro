
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, UserCheck, HeartPulse, Cake, Book, MessageCircle, AlertTriangle } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { Badge } from '../components/ui/badge';
import { CustomBadge } from '../components/ui/CustomBadge';
import { useUser } from '../contexts/UserContext';
import { format, addDays, isWithinInterval, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { USER_COLORS } from '../contexts/UserTypes';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'absence' | 'sick' | 'training' | 'meeting' | 'birthday' | 'other';
  description?: string;
  userId?: string; // For absence events to track which user is absent
  createdBy?: string; // To track who created the event
}

// Helper to get correct Easter date
const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
};

// German holidays for the current year with correct calculations
const getGermanHolidays = (year: number): CalendarEvent[] => {
  // Calculate Easter Sunday
  const easterSunday = getEasterSunday(year);
  
  // Calculate Good Friday (2 days before Easter Sunday)
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  
  // Calculate Easter Monday (1 day after Easter Sunday)
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);
  
  // Calculate Ascension Day (39 days after Easter Sunday)
  const ascensionDay = new Date(easterSunday);
  ascensionDay.setDate(easterSunday.getDate() + 39);
  
  // Calculate Whit Monday (50 days after Easter Sunday)
  const whitMonday = new Date(easterSunday);
  whitMonday.setDate(easterSunday.getDate() + 50);
  
  return [
    { id: `new-year-${year}`, title: 'Neujahr', date: new Date(year, 0, 1), type: 'holiday' },
    { id: `good-friday-${year}`, title: 'Karfreitag', date: goodFriday, type: 'holiday' },
    { id: `easter-sunday-${year}`, title: 'Ostersonntag', date: easterSunday, type: 'holiday' },
    { id: `easter-monday-${year}`, title: 'Ostermontag', date: easterMonday, type: 'holiday' },
    { id: `labor-day-${year}`, title: 'Tag der Arbeit', date: new Date(year, 4, 1), type: 'holiday' },
    { id: `ascension-${year}`, title: 'Christi Himmelfahrt', date: ascensionDay, type: 'holiday' },
    { id: `whit-monday-${year}`, title: 'Pfingstmontag', date: whitMonday, type: 'holiday' },
    { id: `german-unity-${year}`, title: 'Tag der Deutschen Einheit', date: new Date(year, 9, 3), type: 'holiday' },
    { id: `christmas-eve-${year}`, title: 'Heiligabend', date: new Date(year, 11, 24), type: 'holiday' },
    { id: `christmas-day-${year}`, title: 'Weihnachten', date: new Date(year, 11, 25), type: 'holiday' },
    { id: `boxing-day-${year}`, title: 'Zweiter Weihnachtstag', date: new Date(year, 11, 26), type: 'holiday' },
    { id: `new-years-eve-${year}`, title: 'Silvester', date: new Date(year, 11, 31), type: 'holiday' }
  ];
};

// Event emojis by type
const getEventEmoji = (type: string): string => {
  switch (type) {
    case 'holiday':
      return '🎉';
    case 'absence':
      return '🏖️';
    case 'sick':
      return '🤒';
    case 'training':
      return '📚';
    case 'meeting':
      return '📅';
    case 'birthday':
      return '🎂';
    default:
      return '📌';
  }
};

const CalendarPage: React.FC = () => {
  const { users, currentUser, isAdmin } = useUser();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date(),
    type: 'other',
    description: '',
  });
  const [adminView, setAdminView] = useState<'all' | 'absences' | 'sick'>('all');
  
  // Assign colors to users if they don't have one already
  const usersWithColors = users.map((user, index) => ({
    ...user,
    color: USER_COLORS[index % USER_COLORS.length].primary
  }));
  
  // Load events from localStorage or initialize with holidays
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const holidays = [...getGermanHolidays(currentYear), ...getGermanHolidays(nextYear)];
    
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        
        // Filter out old holidays and add new ones
        const filteredEvents = eventsWithDates.filter((event: CalendarEvent) => 
          event.type !== 'holiday' || event.date.getFullYear() >= currentYear
        );
        
        // Add new holidays only if they don't exist
        const existingHolidayIds = filteredEvents
          .filter((e: CalendarEvent) => e.type === 'holiday')
          .map((e: CalendarEvent) => e.id);
        
        const newHolidays = holidays.filter(holiday => !existingHolidayIds.includes(holiday.id));
        
        setEvents([...filteredEvents, ...newHolidays]);
      } catch (e) {
        console.error('Error parsing stored events:', e);
        setEvents(holidays);
      }
    } else {
      // Initialize with holidays if no stored events
      setEvents(holidays);
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);
  
  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    if (!isValid(date)) return [];
    
    return events.filter(event => {
      // Check for single-day events
      const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
      };
      
      // Check if the date falls within a multi-day event
      const isWithinEvent = event.endDate ? 
        isWithinInterval(date, { 
          start: new Date(event.date), 
          end: new Date(event.endDate) 
        }) : false;
      
      return isSameDay(event.date, date) || isWithinEvent;
    });
  };
  
  // Get events for admin overview
  const getFilteredEvents = () => {
    if (!isAdmin) return [];
    
    let filtered = events;
    
    // Apply filter based on admin view
    if (adminView === 'absences') {
      filtered = events.filter(event => event.type === 'absence');
    } else if (adminView === 'sick') {
      filtered = events.filter(event => event.type === 'sick');
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Check if an event already exists to avoid duplicates
  const eventExists = (type: string, userId: string, date: Date, endDate?: Date): boolean => {
    return events.some(event => {
      // Skip if not the same type or user
      if (event.type !== type || event.userId !== userId) return false;
      
      // Check for single-day overlap
      const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
      };
      
      // Single day events
      if (!endDate && !event.endDate) {
        return isSameDay(event.date, date);
      }
      
      // Multi-day events
      if (endDate && event.endDate) {
        return (
          (date <= event.endDate && endDate >= event.date) || // Overlapping periods
          isSameDay(event.date, date) || // Same start date
          isSameDay(event.endDate, endDate) // Same end date
        );
      }
      
      // One is single day, one is multi-day
      if (endDate && !event.endDate) {
        return date <= event.date && endDate >= event.date;
      }
      
      if (!endDate && event.endDate) {
        return date >= event.date && date <= event.endDate;
      }
      
      return false;
    });
  };
  
  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für den Termin ein.",
        variant: "destructive"
      });
      return;
    }
    
    // For absence/sick events, ensure userId is set
    const userId = (newEvent.type === 'absence' || newEvent.type === 'sick') 
      ? (newEvent.userId || currentUser?.id)
      : newEvent.userId;
    
    // Check for duplicate events to avoid double counting
    if ((newEvent.type === 'absence' || newEvent.type === 'sick') && userId) {
      if (eventExists(newEvent.type, userId, newEvent.date, newEvent.endDate)) {
        toast({
          title: "Termin existiert bereits",
          description: `Dieser ${newEvent.type === 'absence' ? 'Urlaub' : 'Krankheitstag'} ist bereits eingetragen.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...newEvent,
      userId,
      createdBy: currentUser?.id
    };
    
    setEvents(prev => [...prev, event]);
    setIsEventDialogOpen(false);
    
    toast({
      title: "Termin hinzugefügt",
      description: "Der Termin wurde erfolgreich im Kalender eingetragen."
    });
    
    // Reset new event form
    setNewEvent({
      title: '',
      date: new Date(),
      type: 'other',
      description: '',
    });
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    // Check if user has permission to delete this event
    const eventToDelete = events.find(event => event.id === id);
    
    if (!eventToDelete) return;
    
    // Only admin can delete any event, regular users can only delete their own events
    if (!isAdmin && eventToDelete.createdBy !== currentUser?.id && eventToDelete.type !== 'holiday') {
      toast({
        title: "Keine Berechtigung",
        description: "Sie können nur Ihre eigenen Termine löschen.",
        variant: "destructive"
      });
      return;
    }
    
    // Admins can't delete holidays
    if (eventToDelete.type === 'holiday') {
      toast({
        title: "Feiertage können nicht gelöscht werden",
        description: "Feiertage sind im System fest eingetragen.",
        variant: "destructive"
      });
      return;
    }
    
    setEvents(prev => prev.filter(event => event.id !== id));
    setIsViewEventDialogOpen(false);
    setSelectedEvent(null);
    
    toast({
      title: "Termin gelöscht",
      description: "Der Termin wurde erfolgreich aus dem Kalender entfernt."
    });
  };
  
  // View event details
  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  // Get badge color based on event type
  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'destructive';
      case 'absence':
        return 'secondary';
      case 'sick':
        return 'destructive';
      case 'training':
        return 'warning';
      case 'meeting':
        return 'default';
      case 'birthday':
        return 'success';
      default:
        return 'outline';
    }
  };
  
  // Get user's color for events
  const getUserColor = (userId?: string) => {
    if (!userId) return 'bg-gray-400';
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return 'bg-gray-400';
    
    return USER_COLORS[userIndex % USER_COLORS.length].primary;
  };
  
  // Handle date change in the calendar
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Update the new event date too
      setNewEvent(prev => ({ ...prev, date: newDate }));
    }
  };
  
  // Format a date to a string in German locale
  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: de });
  };
  
  // Custom day rendering for the calendar
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    return (
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 right-0 p-0.5">
          {dayEvents.length > 0 && (
            <div className="flex flex-wrap gap-0.5">
              {dayEvents.slice(0, 3).map((event, index) => {
                let dotColor = 'bg-primary';
                
                if (event.type === 'holiday') {
                  dotColor = 'bg-red-500';
                } else if (event.type === 'absence' && event.userId) {
                  dotColor = getUserColor(event.userId);
                } else if (event.type === 'sick') {
                  dotColor = 'bg-pink-500';
                } else if (event.type === 'birthday') {
                  dotColor = 'bg-green-500';
                } else if (event.type === 'training') {
                  dotColor = 'bg-amber-500';
                }
                
                return (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${dotColor}`}
                    title={`${event.title} (${event.type})`}
                  />
                );
              })}
              {dayEvents.length > 3 && (
                <div 
                  className="w-2 h-2 rounded-full bg-gray-400" 
                  title={`${dayEvents.length - 3} weitere Termine`}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center h-full">
          {day.getDate()}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Teamkalender</h1>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => {
                setNewEvent(prev => ({ ...prev, date }));
                setIsEventDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Termin eintragen</span>
            </button>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="w-full"
              locale={de}
              components={{
                DayContent: ({ date }) => renderDay(date)
              }}
            />
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-lg font-medium mb-2">Legende</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Feiertag {getEventEmoji('holiday')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm">Termin {getEventEmoji('meeting')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Schulung {getEventEmoji('training')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Urlaub {getEventEmoji('absence')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-sm">Krankheit {getEventEmoji('sick')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Geburtstag {getEventEmoji('birthday')}</span>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Mitarbeiterfarben</h3>
                <div className="grid grid-cols-2 gap-2">
                  {usersWithColors.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${USER_COLORS[index % USER_COLORS.length].primary}`} />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-1/2 lg:w-3/5">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-medium mb-4">
              {format(date, 'PPPP', { locale: de })}
            </h2>
            
            {isAdmin && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${adminView === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  onClick={() => setAdminView('all')}
                >
                  Alle Termine
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${adminView === 'absences' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  onClick={() => setAdminView('absences')}
                >
                  <UserCheck className="w-4 h-4" />
                  Urlaubsübersicht
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${adminView === 'sick' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  onClick={() => setAdminView('sick')}
                >
                  <HeartPulse className="w-4 h-4" />
                  Krankheitsübersicht
                </button>
              </div>
            )}
            
            {isAdmin && adminView !== 'all' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">
                  {adminView === 'absences' ? 'Urlaubsübersicht' : 'Krankheitsübersicht'}
                </h3>
                
                {getFilteredEvents().length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredEvents().map((event) => (
                      <div 
                        key={event.id} 
                        className="flex justify-between items-start p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleViewEvent(event)}
                      >
                        <div className="flex gap-3">
                          {event.type === 'absence' ? (
                            <UserCheck className={`w-5 h-5 ${getUserColor(event.userId)}`} />
                          ) : (
                            <HeartPulse className="w-5 h-5 text-pink-500" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{event.title}</h3>
                              <CustomBadge 
                                icon={getEventEmoji(event.type)} 
                                label={event.type === 'absence' ? 'Urlaub' : 'Krankheit'}
                                variant={getEventBadgeVariant(event.type) as any}
                              />
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                            {event.userId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Mitarbeiter: {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(event.date)}
                              {event.endDate && ` - ${formatDate(event.endDate)}`}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          className="p-1 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Einträge gefunden
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(date).length > 0 ? (
                  getEventsForDate(date).map((event) => (
                    <div 
                      key={event.id} 
                      className="flex justify-between items-start p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="flex gap-3">
                        <CalendarIcon className={`w-5 h-5 ${
                          event.type === 'holiday' ? 'text-red-500' : 
                          event.type === 'absence' && event.userId ? getUserColor(event.userId) :
                          event.type === 'sick' ? 'text-pink-500' :
                          event.type === 'birthday' ? 'text-green-500' :
                          event.type === 'training' ? 'text-amber-500' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{event.title}</h3>
                            <CustomBadge 
                              icon={getEventEmoji(event.type)} 
                              label={event.type === 'holiday' ? 'Feiertag' : 
                                    event.type === 'absence' ? 'Urlaub' :
                                    event.type === 'sick' ? 'Krankheit' :
                                    event.type === 'training' ? 'Schulung' :
                                    event.type === 'meeting' ? 'Meeting' : 
                                    event.type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
                              variant={getEventBadgeVariant(event.type) as any}
                            />
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                          {event.endDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(event.date)} - {formatDate(event.endDate)}
                            </p>
                          )}
                          {(event.type === 'absence' || event.type === 'sick') && event.userId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Mitarbeiter: {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {((isAdmin && event.type !== 'holiday') || 
                        (event.createdBy === currentUser?.id && event.type !== 'holiday')) && (
                        <div className="flex items-center gap-1">
                          <button 
                            className="p-1 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Termine für diesen Tag
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog to add a new event */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neuen Termin eintragen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-title">
                Titel*
              </label>
              <input
                id="event-title"
                className="w-full p-2 rounded-md border border-input"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-type">
                  Typ
                </label>
                <select
                  id="event-type"
                  className="w-full p-2 rounded-md border border-input"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                >
                  <option value="meeting">Meeting</option>
                  <option value="training">Schulung</option>
                  <option value="absence">Urlaub</option>
                  <option value="sick">Krankheit</option>
                  <option value="birthday">Geburtstag</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              
              {(newEvent.type === 'absence' || newEvent.type === 'sick') && isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="event-user">
                    Mitarbeiter
                  </label>
                  <select
                    id="event-user"
                    className="w-full p-2 rounded-md border border-input"
                    value={newEvent.userId || currentUser?.id}
                    onChange={(e) => setNewEvent({...newEvent, userId: e.target.value})}
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Startdatum
                </label>
                <input
                  type="date"
                  className="w-full p-2 rounded-md border border-input"
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => setNewEvent({
                    ...newEvent, 
                    date: e.target.value ? new Date(e.target.value) : new Date()
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enddatum (optional)
                </label>
                <input
                  type="date"
                  className="w-full p-2 rounded-md border border-input"
                  value={newEvent.endDate ? format(newEvent.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setNewEvent({
                    ...newEvent, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-description">
                Beschreibung
              </label>
              <textarea
                id="event-description"
                className="w-full p-2 rounded-md border border-input min-h-[80px]"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsEventDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleAddEvent}
            >
              Termin speichern
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog to view event details */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{getEventEmoji(selectedEvent.type)} {selectedEvent.title}</span>
                <Badge variant={getEventBadgeVariant(selectedEvent.type)}>
                  {selectedEvent.type === 'holiday' ? 'Feiertag' : 
                   selectedEvent.type === 'absence' ? 'Urlaub' :
                   selectedEvent.type === 'sick' ? 'Krankheit' :
                   selectedEvent.type === 'training' ? 'Schulung' :
                   selectedEvent.type === 'meeting' ? 'Meeting' : 
                   selectedEvent.type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {formatDate(selectedEvent.date)}
                {selectedEvent.endDate && ` - ${formatDate(selectedEvent.endDate)}`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedEvent.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-1">Beschreibung</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              {(selectedEvent.type === 'absence' || selectedEvent.type === 'sick') && selectedEvent.userId && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Mitarbeiter</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getUserColor(selectedEvent.userId)}`} />
                    <p className="text-sm text-muted-foreground">
                      {users.find(u => u.id === selectedEvent.userId)?.name || 'Unbekannt'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <button
                className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
                onClick={() => setIsViewEventDialogOpen(false)}
              >
                Schließen
              </button>
              {((isAdmin && selectedEvent.type !== 'holiday') || 
                (selectedEvent.createdBy === currentUser?.id && selectedEvent.type !== 'holiday')) && (
                <button
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  Termin löschen
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AppLayout>
  );
};

export default CalendarPage;
