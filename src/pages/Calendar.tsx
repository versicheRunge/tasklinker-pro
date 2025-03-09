
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Calendar as CalendarIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { Badge } from '../components/ui/badge';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'absence' | 'training' | 'meeting' | 'other';
  description?: string;
  userId?: string; // For absence events to track which user is absent
}

// German holidays for the current year
const getGermanHolidays = (year: number): CalendarEvent[] => {
  return [
    { id: `new-year-${year}`, title: 'Neujahr', date: new Date(year, 0, 1), type: 'holiday' },
    { id: `good-friday-${year}`, title: 'Karfreitag', date: new Date(year, 3, 7), type: 'holiday' }, // Approximate for 2024
    { id: `easter-monday-${year}`, title: 'Ostermontag', date: new Date(year, 3, 10), type: 'holiday' }, // Approximate for 2024
    { id: `labor-day-${year}`, title: 'Tag der Arbeit', date: new Date(year, 4, 1), type: 'holiday' },
    { id: `ascension-${year}`, title: 'Christi Himmelfahrt', date: new Date(year, 4, 9), type: 'holiday' }, // Approximate for 2024
    { id: `whit-monday-${year}`, title: 'Pfingstmontag', date: new Date(year, 4, 20), type: 'holiday' }, // Approximate for 2024
    { id: `german-unity-${year}`, title: 'Tag der Deutschen Einheit', date: new Date(year, 9, 3), type: 'holiday' },
    { id: `christmas-eve-${year}`, title: 'Heiligabend', date: new Date(year, 11, 24), type: 'holiday' },
    { id: `christmas-day-${year}`, title: 'Weihnachten', date: new Date(year, 11, 25), type: 'holiday' },
    { id: `boxing-day-${year}`, title: '2. Weihnachtstag', date: new Date(year, 11, 26), type: 'holiday' },
    { id: `new-years-eve-${year}`, title: 'Silvester', date: new Date(year, 11, 31), type: 'holiday' }
  ];
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
  
  // Load events from localStorage or initialize with holidays
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    const currentYear = new Date().getFullYear();
    const holidays = getGermanHolidays(currentYear);
    
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        setEvents(eventsWithDates);
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
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    };
    
    return events.filter(event => 
      isSameDay(event.date, date) || 
      (event.endDate && date >= event.date && date <= event.endDate)
    );
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
    
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...newEvent,
      userId: newEvent.type === 'absence' ? currentUser?.id : undefined
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
      case 'training':
        return 'warning';
      case 'meeting':
        return 'default';
      default:
        return 'outline';
    }
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
              {dayEvents.slice(0, 2).map((event, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full bg-${event.type === 'holiday' ? 'red' : 'primary'}-500`}
                />
              ))}
              {dayEvents.length > 2 && <div className="w-2 h-2 rounded-full bg-gray-400" />}
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
            {isAdmin && (
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
            )}
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
                <span className="text-sm">Feiertag</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm">Termin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Schulung</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm">Abwesenheit</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 lg:w-3/5">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-medium mb-4">
              {format(date, 'PPPP', { locale: de })}
            </h2>
            
            <div className="space-y-4">
              {getEventsForDate(date).length > 0 ? (
                getEventsForDate(date).map((event) => (
                  <div 
                    key={event.id} 
                    className="flex justify-between items-start p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex gap-3">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant={getEventBadgeVariant(event.type)}>
                            {event.type === 'holiday' ? 'Feiertag' : 
                             event.type === 'absence' ? 'Abwesenheit' :
                             event.type === 'training' ? 'Schulung' :
                             event.type === 'meeting' ? 'Meeting' : 'Sonstiges'}
                          </Badge>
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
                        {event.type === 'absence' && event.userId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Mitarbeiter: {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isAdmin && event.type !== 'holiday' && (
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
                  <option value="absence">Abwesenheit/Urlaub</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              
              {newEvent.type === 'absence' && (
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
                <span>{selectedEvent.title}</span>
                <Badge variant={getEventBadgeVariant(selectedEvent.type)}>
                  {selectedEvent.type === 'holiday' ? 'Feiertag' : 
                   selectedEvent.type === 'absence' ? 'Abwesenheit' :
                   selectedEvent.type === 'training' ? 'Schulung' :
                   selectedEvent.type === 'meeting' ? 'Meeting' : 'Sonstiges'}
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
              
              {selectedEvent.type === 'absence' && selectedEvent.userId && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Mitarbeiter</h3>
                  <p className="text-sm text-muted-foreground">
                    {users.find(u => u.id === selectedEvent.userId)?.name || 'Unbekannt'}
                  </p>
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
              {isAdmin && selectedEvent.type !== 'holiday' && (
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
