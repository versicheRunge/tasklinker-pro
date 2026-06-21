
import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, UserCheck, HeartPulse, Plane, Stethoscope, RefreshCw, ExternalLink } from 'lucide-react';
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
import { HandoverDialog } from '../components/calendar/HandoverDialog';
import { VacationRequestDialog } from '../components/calendar/VacationRequestDialog';
import { CalendarEvent } from '../types/calendar';
import { useAgencyCalendar, buildGoogleCalendarAddUrl } from '../hooks/useAgencyCalendar';
import { MyVacationRequests } from '../components/calendar/MyVacationRequests';

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

  const [handover, setHandover] = useState<{ start: string; end: string } | null>(null);
  const [vacReqOpen, setVacReqOpen] = useState(false);
  const [vacReqType, setVacReqType] = useState<'vacation' | 'sick'>('vacation');
  const [gcalAddUrl, setGcalAddUrl] = useState<string | null>(null);

  const { events: agencyEvents, isLoading: agencyLoading, isConfigured: agencyConfigured, lastSynced, refresh: agencyRefresh } = useAgencyCalendar();

  const formattedDate = format(date, 'yyyy-MM-dd');
  const agencyTodayEvents = agencyEvents.filter(e => {
    const d = e.allDay ? e.start.slice(0, 10) : e.start.slice(0, 10);
    return d === formattedDate;
  });

  const generateUniqueId = () => `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const handleSaveEvent = (): boolean => {
    const completeEvent: CalendarEvent = { id: generateUniqueId(), ...newEvent };
    const ok = handleAddEvent(completeEvent);
    if (ok && newEvent.type === 'absence' && currentUser) {
      setHandover({ start: newEvent.startDate ?? '', end: newEvent.endDate ?? newEvent.startDate ?? '' });
      // Offer Google Calendar quick-add for the absence
      if (newEvent.startDate) {
        setGcalAddUrl(buildGoogleCalendarAddUrl(
          newEvent.title || `Abwesenheit: ${currentUser.name}`,
          newEvent.startDate,
          newEvent.endDate ?? newEvent.startDate,
          'Eingetragen über TaskLinker',
        ));
      }
    }
    return ok;
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Teamkalender</h1>
            <div className="flex gap-2 flex-wrap">
              {!isAdmin && (
                <>
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    onClick={() => { setVacReqType('vacation'); setVacReqOpen(true); }}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    Urlaub beantragen
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                    onClick={() => { setVacReqType('sick'); setVacReqOpen(true); }}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Krank melden
                  </button>
                </>
              )}
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
          </div>

          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <CustomCalendar
              date={date}
              onDateChange={handleDateChange}
              events={events}
            />
          </div>

          <CalendarLegend users={users} isAdmin={isAdmin} />
          {!isAdmin && <MyVacationRequests />}
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

              {agencyConfigured && agencyTodayEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Google Teamkalender
                  </p>
                  {agencyTodayEvents.map(e => {
                    const timeStr = !e.allDay
                      ? new Date(e.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                      : 'Ganztägig';
                    return (
                      <div key={e.id} className="flex items-start gap-2 py-2 px-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg mb-1.5 text-sm">
                        <span className="text-blue-500 shrink-0 font-medium w-14">{timeStr}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{e.title}</p>
                          {e.location && <p className="text-xs text-muted-foreground truncate">{e.location}</p>}
                        </div>
                        {e.htmlLink && (
                          <a href={e.htmlLink} target="_blank" rel="noopener noreferrer" className="shrink-0 text-blue-400 hover:text-blue-600">
                            <RefreshCw className="w-3.5 h-3.5 rotate-45" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {agencyConfigured && agencyTodayEvents.length === 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Keine Google-Termine an diesem Tag
                  </p>
                </div>
              )}
              </div>
            )}

            {agencyConfigured && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Teamkalender synchronisiert
                {lastSynced && <span className="opacity-60">· {lastSynced.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>}
                <button onClick={agencyRefresh} className="hover:text-foreground ml-auto" title="Jetzt synchronisieren">
                  <RefreshCw className={`w-3 h-3 ${agencyLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}

            {gcalAddUrl && (
              <div className="mt-3 flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                <span className="flex-1">Abwesenheit auch im Google Kalender eintragen?</span>
                <a href={gcalAddUrl} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline shrink-0"
                  onClick={() => setGcalAddUrl(null)}
                >
                  Zu Google Kalender hinzufügen →
                </a>
                <button onClick={() => setGcalAddUrl(null)} className="text-muted-foreground hover:text-foreground">✕</button>
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

      {handover && currentUser && (
        <HandoverDialog
          currentUser={currentUser}
          users={users}
          vacationStart={handover.start}
          vacationEnd={handover.end}
          onClose={() => setHandover(null)}
        />
      )}

      <VacationRequestDialog
        isOpen={vacReqOpen}
        onOpenChange={setVacReqOpen}
        defaultType={vacReqType}
      />
    </AppLayout>
  );
};

export default CalendarPage;
