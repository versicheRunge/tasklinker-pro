
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Mail, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';

export const EmailSignature: React.FC = () => {
  const { currentUser } = useUser();
  const { saveSignature, getUserSignature } = useEmailTemplates();
  
  const [signature, setSignature] = useState('');
  const [includeUserDetails, setIncludeUserDetails] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      const userSignature = getUserSignature(currentUser.id);
      if (userSignature) {
        setSignature(userSignature.content);
        setIncludeUserDetails(userSignature.includeUserDetails);
      } else {
        // Default signature
        setSignature(`Mit freundlichen Grüßen,\n\n${currentUser.name}`);
      }
    }
  }, [currentUser, getUserSignature]);
  
  const handleSaveSignature = () => {
    if (currentUser) {
      saveSignature(currentUser.id, {
        content: signature,
        includeCompanyLogo: false, // We keep this for compatibility but don't expose it in the UI
        includeUserDetails
      });
      
      toast({
        title: "Signatur gespeichert",
        description: "Ihre E-Mail-Signatur wurde erfolgreich gespeichert."
      });
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-Mail-Signatur
        </CardTitle>
        <CardDescription>
          Passen Sie Ihre E-Mail-Signatur an, die automatisch an Ihre E-Mails angehängt wird.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="signature">Ihre Signatur</Label>
          <Textarea
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={6}
            placeholder="Geben Sie Ihre Signatur ein"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="details-switch">Kontaktdaten einfügen</Label>
              <p className="text-sm text-muted-foreground">
                Fügt Ihre Kontaktdaten (Name, Abteilung, E-Mail, Telefon) ein
              </p>
            </div>
            <Switch
              id="details-switch"
              checked={includeUserDetails}
              onCheckedChange={setIncludeUserDetails}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSignature} className="ml-auto">
          <Save className="h-4 w-4 mr-2" />
          Signatur speichern
        </Button>
      </CardFooter>
    </Card>
  );
};
