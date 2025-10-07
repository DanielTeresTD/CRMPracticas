import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as jsPDF from 'jspdf';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';


import { StatisticsDataUsage } from '../../interfaces/dataUsage';
import { ClientData } from '../../interfaces/clients';

@Component({
  selector: 'app-export-to-pdf',
  imports: [CommonModule],
  templateUrl: './export-to-pdf.html',
  styleUrl: './export-to-pdf.scss'
})
export class ExportToPdf {
  @Input() public charts?: any[] = [];
  @Input() public selectedPhoneNumber?: string;
  @Input() public client?: ClientData;
  @Input() public clientDataUsage?: StatisticsDataUsage;

  public async exportToPDF() {
    if (!this.charts || this.charts.length === 0) {
      throw Error('No charts available for export');
    }

    const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
    // Get dimensions of pdf document
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // tittle of document
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    // Second and third param to give position of where introduce the text.
    pdf.text('Data usage report', pageWidth / 2, 15, { align: 'center' });

    // Give more info about the report for that client
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Client: ${this.client?.name || 'Unknown Client'}`, 20, 35);
    pdf.text(`Phone: ${this.selectedPhoneNumber || 'N/A'}`, 20, 45);
    pdf.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 55);

    // Start Position of graphs
    let yPosition = 70;

    for (let i = 0; i < this.charts.length; i++) {
      const chart = this.charts[i];

      try {
        const canvas = chart.canvas;
        if (!canvas) continue;

        // return data URL specified by type parameter.
        // 1st param --> Type which indicate image format
        // 2nd param --> quality of image
        const imgData = canvas.toDataURL('image/png', 1.0);
        // Set margin of the graphs
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if there is enough space in that page to put chart
        if (yPosition + imgHeight + 30 > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }

        // Add new image (the chart)
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20;
      } catch (error) {
        console.error(`Error procesing chart ${i}`, error);
      }
    }

    const downloadsDir = path.join(os.homedir(), 'Downloads');
    const phoneForFile = this.selectedPhoneNumber?.replace(/[^0-9]/g, '') || 'unknown';
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `data-usage-report-${phoneForFile}-${timestamp}.pdf`;
    const fullPath = path.join(downloadsDir, fileName);

    try {
      const pdfBuffer = pdf.output('arraybuffer');
      await fs.writeFile(fullPath, Buffer.from(pdfBuffer));

      console.log(`✅ PDF guardado en: ${fullPath}`);

    } catch (error) {
      console.error("Failed to save pdf on downloads", error);
      throw error;
    }
  }
}
