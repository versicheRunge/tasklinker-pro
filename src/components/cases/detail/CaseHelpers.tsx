
import { jsPDF } from "jspdf";
import { CaseItem, CaseStatus, CaseActivity } from "../../../types/case";
import 'jspdf-autotable';

interface PdfOptions {
  includeActivities?: boolean;
  includeChecklist?: boolean;
  activityLimit?: number;
}

export const generatePDF = (caseItem: CaseItem, options: PdfOptions = {}) => {
  const {
    includeActivities = true,
    includeChecklist = true,
    activityLimit = 10
  } = options;
  
  const customerName = caseItem.customerName || 'Kunde';
  const fileName = `${customerName}_${caseItem.title}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Vorgangsdetails', 14, 20);
  
  // Add case info
  doc.setFontSize(12);
  // Replace 'case' with 'Vorgang' in the ID
  const formattedId = caseItem.id.replace('case', 'Vorgang');
  doc.text(`Vorgangsnummer: ${formattedId}`, 14, 30);
  doc.text(`Titel: ${caseItem.title}`, 14, 37);
  doc.text(`Kunde: ${customerName}`, 14, 44);
  
  const statusLabel = {
    new: 'Neu',
    in_progress: 'In Bearbeitung',
    waiting: 'Wartet auf Rückmeldung',
    completed: 'Erledigt'
  };
  
  const typeLabel = {
    damage: 'Schadensmeldung',
    evb: 'eVB-Anfrage',
    contract_change: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    other: 'Sonstiges'
  };
  
  doc.text(`Status: ${statusLabel[caseItem.status as CaseStatus]}`, 14, 51);
  doc.text(`Typ: ${typeLabel[caseItem.type as keyof typeof typeLabel] || caseItem.type}`, 14, 58);
  doc.text(`Erstellt am: ${new Date(caseItem.createdAt).toLocaleDateString('de-DE')}`, 14, 65);
  doc.text(`Zugewiesen an: ${caseItem.assignee.name}`, 14, 72);
  
  // Add description
  doc.setFontSize(14);
  doc.text('Beschreibung', 14, 85);
  doc.setFontSize(12);
  
  const descriptionLines = doc.splitTextToSize(caseItem.description, 180);
  doc.text(descriptionLines, 14, 92);
  
  let yPos = 95 + descriptionLines.length * 7;
  
  // Add checklist with proper checkbox symbols
  if (includeChecklist && caseItem.checklist && caseItem.checklist.length > 0) {
    doc.setFontSize(14);
    doc.text('Checkliste', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    caseItem.checklist.forEach((item) => {
      // Better checkbox symbols
      const checkboxSymbol = item.completed ? '✓' : '□';
      doc.text(`${checkboxSymbol} ${item.text}`, 14, yPos);
      yPos += 7;
      
      if (item.description) {
        doc.setFontSize(10);
        const descLines = doc.splitTextToSize(item.description, 170);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 6;
        doc.setFontSize(12);
      }
      
      // Add sub-items with proper checkbox symbols
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach(subItem => {
          const subCheckboxSymbol = subItem.completed ? '✓' : '□';
          doc.text(`   ${subCheckboxSymbol} ${subItem.text}`, 20, yPos);
          yPos += 7;
        });
      }
    });
  }
  
  // Add activities
  if (includeActivities && caseItem.activities && caseItem.activities.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Aktivitäten', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    
    // Only include limited activities to save space
    const recentActivities = caseItem.activities.slice(0, activityLimit);
    
    recentActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleString('de-DE');
      const user = activity.user.name;
      
      doc.text(`${date} - ${user}:`, 14, yPos);
      yPos += 6;
      
      const contentLines = doc.splitTextToSize(activity.content, 180);
      doc.text(contentLines, 20, yPos);
      yPos += contentLines.length * 6 + 4;
      
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
  
  // Save the PDF
  doc.save(fileName);
  
  return fileName;
};

export const sendNotification = (
  _userId: string,
  _title: string,
  _message: string,
  _caseId: string
) => {
  // Notifications are handled via Supabase in UserContext.addNotification
};

export const checkAllCasesCompleted = () => false;
