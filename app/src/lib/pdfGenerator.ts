import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html2canvas';

/**
 * Generates a professional PDF report for burn assessments
 * @param content - Clinical note content
 * @param bodyMapElement - Optional HTML element containing body map visualization
 * @param institutionName - Institution name for header
 * @returns PDF bytes (Uint8Array)
 */
export async function generatePDFReport(
  content: string,
  bodyMapElement?: HTMLElement,
  institutionName: string = 'Burn Center'
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  
  // Set up fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  try {
    // Add institution header
    page.drawText(institutionName, {
    x: 50,
    y: 800,
    size: 16,
    font: boldFont,
    color: rgb(0, 0.2, 0.4),
  });
  
  page.drawText('Burn Assessment Report', {
    x: 50,
    y: 780,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawLine({
    start: { x: 50, y: 775 },
    end: { x: 545, y: 775 },
    thickness: 1,
    color: rgb(0, 0.2, 0.4),
  });
  
  // Add report content
  const lines = content.split('\n');
  let yPosition = 750;
  
  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if we run out of space
      const newPage = pdfDoc.addPage([595, 842]);
      yPosition = 800;
      page = newPage;
    }
    
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
  }
  
  // Add body map visualization if available
  if (bodyMapElement) {
    try {
      const canvas = await html2canvas(bodyMapElement);
      const imageData = await new Promise<Uint8Array>((resolve) => {
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
          reader.readAsArrayBuffer(blob!);
        }, 'image/png');
      });
      
      const image = await pdfDoc.embedPng(imageData);
      const { width, height } = image.scale(0.5);
      
      page.drawImage(image, {
        x: 50,
        y: yPosition - height - 20,
        width,
        height,
      });
    } catch (error) {
      console.error('Failed to capture body map:', error);
      page.drawText('Body Map Visualization Unavailable', {
        x: 50,
        y: yPosition - 30,
        size: 10,
        font: font,
        color: rgb(0.5, 0, 0),
      });
    }
  }
  
  // Add footer
  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: 30,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
    return await pdfDoc.save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF document');
  }
}

/**
 * Redacts PHI (Protected Health Information) from text content
 * @param content - Text content to redact
 * @returns Redacted content
 */
export function redactPHI(content: string): string {
  const PHI_PATTERNS = [
    // Patient identifiers
    /(\b(name|patient|pt)\b:\s*)([^\n]+)/gi,
    /(\b(dob|date of birth)\b:\s*)([^\n]+)/gi,
    /(\b(mrn|id)\b:\s*)([^\n]+)/gi,
    // Contact information
    /(\b(address|phone|contact)\b:\s*)([^\n]+)/gi,
    // Provider identifiers
    /(\b(provider|dr|md)\b\.?\s*)([^\n]+)/gi
  ];
  
  return PHI_PATTERNS.reduce((text, pattern) => 
    text.replace(pattern, '$1[REDACTED]'), content);
}
