
import { AdminUtils } from './AdminUtils';

/**
 * Initialisiert versteckte Funktionen und andere App-weite Einstellungen
 */
export const initializeApp = () => {
  // Tastaturkürzel für Admin-Funktionen initialisieren
  AdminUtils.initialize();
  
  // Wird bei Bedarf mit weiteren Initialisierungsfunktionen erweitert
  console.log("App erfolgreich initialisiert");
};
