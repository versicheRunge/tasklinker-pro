import { toast } from "../hooks/use-toast";

/**
 * AdminUtils - Ein verstecktes Utility mit Funktionen, die über Tastenkombinationen 
 * aufgerufen werden können
 */

interface AppSettings {
  appName: string;
  logoUrl: string;
  tips?: string[]; // Array von Tipps des Tages
}

export class AdminUtils {
  private static initialized = false;
  private static keySequence: string[] = [];
  private static resetSequence = "rustwrkx"; // Tastenkombination zum Zurücksetzen: r-u-s-t-w-r-k-x
  private static settingsSequence = "trtmadmn"; // Tastenkombination für Einstellungen: t-r-t-m-a-d-m-n
  private static tipsSequence = "daytips"; // Tastenkombination für Tipps des Tages: d-a-y-t-i-p-s
  
  // Standardeinstellungen
  private static defaultSettings: AppSettings = {
    appName: "TruTeam",
    logoUrl: "/logo.png",
    tips: ["Nutze @-Erwähnungen um Teammitglieder zu benachrichtigen", 
           "Über die Schnellsuche findest du alles, was du brauchst", 
           "Regelmäßige Updates helfen deinem Team auf dem Laufenden zu bleiben"]
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
      
      // Prüfe auf Tipps-Sequenz
      else if (currentSequence.includes(this.tipsSequence)) {
        this.openTipsDialog();
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
   * Gibt einen zufälligen Tipp des Tages zurück
   */
  public static getRandomTip(): string {
    if (!this.settings.tips || this.settings.tips.length === 0) {
      return "Tipp des Tages: Regelmäßige Updates helfen deinem Team auf dem Laufenden zu bleiben.";
    }
    
    const randomIndex = Math.floor(Math.random() * this.settings.tips.length);
    return `Tipp des Tages: ${this.settings.tips[randomIndex]}`;
  }

  /**
   * Öffnet einen Dialog zum Bearbeiten der Tipps des Tages
   */
  private static openTipsDialog(): void {
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
    dialogContent.style.width = '600px';
    dialogContent.style.maxWidth = '90%';
    dialogContent.style.maxHeight = '80vh';
    dialogContent.style.overflowY = 'auto';

    let tipsHtml = '';
    if (this.settings.tips && this.settings.tips.length > 0) {
      this.settings.tips.forEach((tip, index) => {
        tipsHtml += `
          <div style="display: flex; margin-bottom: 0.5rem; gap: 0.5rem;">
            <input type="text" id="tip-${index}" value="${tip}" style="flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
            <button class="remove-tip" data-index="${index}" style="padding: 0.5rem; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Entfernen</button>
          </div>
        `;
      });
    }

    dialogContent.innerHTML = `
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Tipps des Tages verwalten</h2>
      <p style="margin-bottom: 1rem;">Diese Tipps werden im Dashboard täglich wechselnd angezeigt.</p>
      <div id="tips-container" style="margin-bottom: 1rem;">
        ${tipsHtml}
      </div>
      <button id="add-tip" style="width: 100%; padding: 0.5rem; background-color: #4CAF50; color: white; border: none; border-radius: 4px; margin-bottom: 1.5rem; cursor: pointer;">+ Neuen Tipp hinzufügen</button>
      <div style="display: flex; justify-content: space-between;">
        <button id="admin-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ccc; background-color: #f2f2f2; border-radius: 4px; cursor: pointer;">Abbrechen</button>
        <button id="admin-save" style="padding: 0.5rem 1rem; background-color: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Speichern</button>
      </div>
    `;

    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);

    // Event-Listener für den "Neuen Tipp hinzufügen" Button
    document.getElementById('add-tip')?.addEventListener('click', () => {
      const tipsContainer = document.getElementById('tips-container');
      if (!tipsContainer) return;
      
      const newIndex = tipsContainer.children.length;
      const newTipDiv = document.createElement('div');
      newTipDiv.style.display = 'flex';
      newTipDiv.style.marginBottom = '0.5rem';
      newTipDiv.style.gap = '0.5rem';
      
      newTipDiv.innerHTML = `
        <input type="text" id="tip-${newIndex}" value="" style="flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" placeholder="Neuen Tipp eingeben...">
        <button class="remove-tip" data-index="${newIndex}" style="padding: 0.5rem; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Entfernen</button>
      `;
      
      tipsContainer.appendChild(newTipDiv);
      
      // Event-Listener für den neuen "Entfernen" Button
      newTipDiv.querySelector('.remove-tip')?.addEventListener('click', function() {
        tipsContainer.removeChild(newTipDiv);
      });
    });
    
    // Event-Listener für die "Entfernen" Buttons
    document.querySelectorAll('.remove-tip').forEach(button => {
      button.addEventListener('click', function(e) {
        const target = e.target as HTMLElement;
        const tipElement = target.closest('div');
        if (tipElement && tipElement.parentNode) {
          tipElement.parentNode.removeChild(tipElement);
        }
      });
    });

    // Event-Listener für die Buttons
    document.getElementById('admin-cancel')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    document.getElementById('admin-save')?.addEventListener('click', () => {
      const tipInputs = document.querySelectorAll('[id^="tip-"]');
      const tips: string[] = [];
      
      tipInputs.forEach(input => {
        const value = (input as HTMLInputElement).value.trim();
        if (value) {
          tips.push(value);
        }
      });
      
      this.settings.tips = tips;
      
      // Einstellungen speichern
      localStorage.setItem('adminSettings', JSON.stringify(this.settings));
      
      toast({
        title: "Tipps gespeichert",
        description: `${tips.length} Tipps des Tages wurden erfolgreich gespeichert.`
      });
      
      document.body.removeChild(dialog);
    });
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
      const appTitleElements = document.querySelectorAll('[class*="app-title"], [class*="app-name"]');
      appTitleElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.innerText = this.settings.appName;
        }
      });
      
      // Logo ändern
      const logoElements = document.querySelectorAll('[class*="app-logo"]');
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

