
import { toast } from "../hooks/use-toast";

/**
 * AdminUtils - Ein verstecktes Utility mit Funktionen, die über Tastenkombinationen 
 * aufgerufen werden können
 */

interface AppSettings {
  appName: string;
  logoUrl: string;
}

export class AdminUtils {
  private static initialized = false;
  private static keySequence: string[] = [];
  private static resetSequence = "rustwrkx"; // Tastenkombination zum Zurücksetzen: r-u-s-t-w-r-k-x
  private static settingsSequence = "trtmadmn"; // Tastenkombination für Einstellungen: t-r-t-m-a-d-m-n
  
  // Standardeinstellungen
  private static defaultSettings: AppSettings = {
    appName: "TruTeam",
    logoUrl: "/logo.png"
  };
  
  // Aktuell gespeicherte Einstellungen
  private static settings: AppSettings = { ...AdminUtils.defaultSettings };

  /**
   * Initialisiert den Tastatur-Listener für versteckte Funktionen
   */
  public static initialize(): void {
    if (this.initialized) return;
    
    // Einstellungen aus dem localStorage laden, falls vorhanden
    const storedSettings = localStorage.getItem('adminSettings');
    if (storedSettings) {
      try {
        this.settings = { ...this.defaultSettings, ...JSON.parse(storedSettings) };
        this.applySettings();
      } catch (e) {
        console.error("Fehler beim Laden der Einstellungen:", e);
      }
    }
    
    // Tastatur-Event-Listener hinzufügen
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
    this.initialized = true;
    console.log("AdminUtils initialisiert");
  }

  /**
   * Verarbeitet Tastatureingaben und prüft auf spezielle Sequenzen
   */
  private static handleKeyPress(event: KeyboardEvent): void {
    // Nur alphanumerische Tasten verfolgen
    if (/^[a-z0-9]$/i.test(event.key)) {
      // Tastendruck zur Sequenz hinzufügen
      this.keySequence.push(event.key.toLowerCase());
      
      // Begrenze die Sequenz auf 10 Zeichen, um Speicherüberlauf zu vermeiden
      if (this.keySequence.length > 10) {
        this.keySequence.shift();
      }
      
      // Prüfe auf Reset-Sequenz
      const currentSequence = this.keySequence.join('');
      if (currentSequence.includes(this.resetSequence)) {
        this.resetAllData();
        this.keySequence = []; // Sequenz zurücksetzen
      }
      
      // Prüfe auf Einstellungs-Sequenz
      else if (currentSequence.includes(this.settingsSequence)) {
        this.openSettingsDialog();
        this.keySequence = []; // Sequenz zurücksetzen
      }
    }
  }

  /**
   * Setzt alle Daten zurück (Vorgänge, Checklisten, usw.)
   */
  private static resetAllData(): void {
    try {
      // Alle gespeicherten Daten aus dem localStorage löschen
      localStorage.removeItem('cases');
      localStorage.removeItem('checklistTemplates');
      localStorage.removeItem('defaultTitles');
      localStorage.removeItem('notifications');
      localStorage.removeItem('chats');
      
      toast({
        title: "System zurückgesetzt",
        description: "Alle Daten wurden erfolgreich zurückgesetzt. Seite wird neu geladen...",
      });
      
      // Seite nach kurzer Verzögerung neu laden, damit der Toast sichtbar ist
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen:", error);
      toast({
        title: "Fehler",
        description: "Beim Zurücksetzen der Daten ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  }

  /**
   * Öffnet einen Dialog zum Ändern des App-Namens und Logos
   */
  private static openSettingsDialog(): void {
    // Erstelle dynamisch einen Dialog
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialog.style.display = 'flex';
    dialog.style.justifyContent = 'center';
    dialog.style.alignItems = 'center';
    dialog.style.zIndex = '9999';

    const dialogContent = document.createElement('div');
    dialogContent.style.backgroundColor = 'white';
    dialogContent.style.padding = '2rem';
    dialogContent.style.borderRadius = '0.5rem';
    dialogContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    dialogContent.style.width = '400px';
    dialogContent.style.maxWidth = '90%';

    dialogContent.innerHTML = `
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Administrator-Einstellungen</h2>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">App-Name:</label>
        <input id="admin-app-name" type="text" value="${this.settings.appName}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Logo-URL:</label>
        <input id="admin-logo-url" type="text" value="${this.settings.logoUrl}" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
        <small style="color: #666; display: block; margin-top: 0.25rem;">Relative URL oder absoluter Pfad für das Logo</small>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <button id="admin-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ccc; background-color: #f2f2f2; border-radius: 4px; cursor: pointer;">Abbrechen</button>
        <button id="admin-save" style="padding: 0.5rem 1rem; background-color: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Speichern</button>
      </div>
    `;

    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);

    // Event-Listener für die Buttons hinzufügen
    document.getElementById('admin-cancel')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    document.getElementById('admin-save')?.addEventListener('click', () => {
      const appNameInput = document.getElementById('admin-app-name') as HTMLInputElement;
      const logoUrlInput = document.getElementById('admin-logo-url') as HTMLInputElement;
      
      if (appNameInput && logoUrlInput) {
        this.settings.appName = appNameInput.value;
        this.settings.logoUrl = logoUrlInput.value;
        
        // Einstellungen speichern und anwenden
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.applySettings();
        
        toast({
          title: "Einstellungen gespeichert",
          description: "Die App-Einstellungen wurden erfolgreich aktualisiert."
        });
      }
      
      document.body.removeChild(dialog);
    });
  }

  /**
   * Wendet gespeicherte Einstellungen auf die App an
   */
  private static applySettings(): void {
    try {
      // App-Namen ändern
      const appTitleElements = document.querySelectorAll('.app-title, .app-name');
      appTitleElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.innerText = this.settings.appName;
        }
      });
      
      // Logo ändern
      const logoElements = document.querySelectorAll('.app-logo');
      logoElements.forEach(el => {
        if (el instanceof HTMLImageElement) {
          el.src = this.settings.logoUrl;
        }
      });
      
      // Titel des Dokuments ändern
      document.title = this.settings.appName;
      
    } catch (error) {
      console.error("Fehler beim Anwenden der Einstellungen:", error);
    }
  }
}
