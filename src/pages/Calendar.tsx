import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, UserCheck, HeartPulse } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Dialog } from "../components/ui/dialog";
import { useUser } from '../contexts/UserContext';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarLegend } from '../components/calendar/CalendarLegend';
import { EventItem } from '../components/calendar/EventItem';
import { AdminFilteredEvents } from '../components/calendar/AdminFilteredEvents';
import { AddEventDialog } from '../components/calendar/AddEventDialog';
import { ViewEventDialog } from '../components/calendar/ViewEventDialog';
import { CustomCalendar } from '../components/calendar/CustomCalendar';
import { CalendarEvent } from '../types/calendar';

const CalendarPage: React.FC = () => {
  const { users, currentUser, isAdmin } = useUser();
  const { 
    date,
    events,
    isEventDialogOpen,
    setIsEventDialogOpen,
    isViewEventDialogOpen,
    setIsViewEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    newEvent,
    setNewEvent,
    adminView,
    setAdminView,
    getFilteredEvents,
    handleAddEvent,
    handleDeleteEvent,
    handleViewEvent,
    handleDateChange,
    getEventsForDate
  } = useCalendar();

  // Function to generate a unique ID
  const generateUniqueId = () => {
    return `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Function to handle saving a new event with ID
  const handleSaveEvent = (): boolean => {
    const completeEvent: CalendarEvent = {
      id: generateUniqueId(),
      ...newEvent
    };
    
    return handleAddEvent(completeEvent);
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
            <CustomCalendar 
              date={date}
              onDateChange={handleDateChange}
              events={events}
            />
          </div>
          
          <CalendarLegend users={users} isAdmin={isAdmin} />
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
              <AdminFilteredEvents 
                filteredEvents={getFilteredEvents()}
                adminView={adminView}
                users={users}
                onView={handleViewEvent}
                onDelete={handleDeleteEvent}
              />
            ) : (
              <div className="space-y-4">
                {getEventsForDate(date).length > 0 ? (
                  getEventsForDate(date).map((event) => (
                    <EventItem 
                      key={event.id}
                      event={event}
                      users={users}
                      currentUserId={currentUser?.id}
                      isAdmin={isAdmin}
                      onDelete={handleDeleteEvent}
                      onView={handleViewEvent}
                    />
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
      
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <AddEventDialog 
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onCancel={() => setIsEventDialogOpen(false)}
          onSave={handleSaveEvent}
          users={users}
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
        />
      </Dialog>
      
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <ViewEventDialog 
            event={selectedEvent}
            onClose={() => setIsViewEventDialogOpen(false)}
            onDelete={handleDeleteEvent}
            users={users}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
          />
        )}
      </Dialog>
    </AppLayout>
  );
};

export default CalendarPage;
