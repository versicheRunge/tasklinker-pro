#!/bin/bash
# TaskLinker Pro - Mac Installation
# Doppelklick zum Ausführen (Terminal öffnet sich kurz)

echo ""
echo "TaskLinker Pro – Mac Protokoll-Installation"
echo "============================================"
echo ""

APP_PATH="$HOME/Applications/TaskLinkerOpen.app"

# AppleScript in temp-Datei schreiben
TMP=$(mktemp /tmp/tasklinker-XXXXXX.applescript)
cat > "$TMP" << 'APPLESCRIPT'
on open location this_URL
  try
    set pathStr to do shell script "python3 -c \"import urllib.parse,sys; print(urllib.parse.unquote(sys.argv[1].replace('tasklinker://','')))\" " & quoted form of this_URL
    do shell script "open " & quoted form of pathStr
  end try
end open location
APPLESCRIPT

# ~/Applications anlegen falls nicht vorhanden
mkdir -p "$HOME/Applications"

# Kompilieren
osacompile -o "$APP_PATH" "$TMP"
rm "$TMP"

# Bei LaunchServices registrieren
LSREG="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
[ -f "$LSREG" ] && "$LSREG" -f "$APP_PATH"

echo ""
echo "Fertig! TaskLinker-Links öffnen jetzt direkt den Finder."
echo "Bitte den Browser einmal neu starten."
echo ""
read -p "Enter drücken zum Beenden..."
