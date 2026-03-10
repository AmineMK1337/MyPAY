import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentHistoryItem } from './analytics';
import { AuthResponse } from './auth';

// Colours mimicking a classic LaTeX article
const BLACK:   [number,number,number] = [0,   0,   0  ];
const DARKGRAY:[number,number,number] = [40,  40,  40 ];
const MIDGRAY: [number,number,number] = [100, 100, 100];
const LIGHTGRAY:[number,number,number]= [220, 220, 220];
const WHITE:   [number,number,number] = [255, 255, 255];
const RULE:    [number,number,number] = [0,   0,   0  ]; // toprule / bottomrule

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  exportPaymentHistory(payments: PaymentHistoryItem[], user: AuthResponse | null): void {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W    = doc.internal.pageSize.getWidth();
    const H    = doc.internal.pageSize.getHeight();
    const ML   = 25;   // left  margin  (LaTeX default ~25mm)
    const MR   = 25;   // right margin
    const TW   = W - ML - MR;  // text width
    const now  = new Date();

    // ─────────────────────────────────────────────────
    // 1.  Title block  (\maketitle)
    // ─────────────────────────────────────────────────

    // institution / logo line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MIDGRAY);
    doc.text('MyPay — Relevé Financier', W / 2, 22, { align: 'center' });

    // thick top rule
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.8);
    doc.line(ML, 25, W - MR, 25);

    // \title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...BLACK);
    doc.text('Historique des Paiements', W / 2, 36, { align: 'center' });

    // \author  /  \date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...DARKGRAY);
    const authorLine = user ? `${user.firstName} ${user.lastName} — ${user.email}` : 'MyPay';
    doc.text(authorLine, W / 2, 44, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...MIDGRAY);
    const dateLine = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(dateLine, W / 2, 51, { align: 'center' });

    // thin bottom rule after title block
    doc.setLineWidth(0.4);
    doc.line(ML, 55, W - MR, 55);

    // ─────────────────────────────────────────────────
    // 2.  Abstract box  (\begin{abstract})
    // ─────────────────────────────────────────────────
    const total   = payments.reduce((s, p) => s + p.amount, 0);
    const paid    = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const late    = payments.filter(p => p.status === 'late').length;

    const abstractX = ML + TW * 0.1;
    const abstractW = TW * 0.8;
    doc.setFontSize(9);
    doc.setTextColor(...MIDGRAY);
    doc.setFont('helvetica', 'bolditalic');
    doc.text('Résumé', W / 2, 62, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARKGRAY);
    const abstractText =
      `Ce document présente l'historique complet des paiements enregistrés dans MyPay. ` +
      `Il recense ${payments.length} transaction(s) pour un montant total de ${total.toFixed(2)} TND, ` +
      `dont ${paid} payée(s), ${pending} en attente et ${late} en retard.`;
    const abstractLines = doc.splitTextToSize(abstractText, abstractW);
    doc.text(abstractLines, W / 2, 68, { align: 'center' });

    doc.setLineWidth(0.3);
    doc.line(ML, 58, W - MR, 58);
    const abstractBottom = 68 + abstractLines.length * 4.5;
    doc.line(ML, abstractBottom, W - MR, abstractBottom);

    // ─────────────────────────────────────────────────
    // 3.  Section heading  (\section{})
    // ─────────────────────────────────────────────────
    const sectionY = abstractBottom + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BLACK);
    doc.text('1   Tableau des transactions', ML, sectionY);

    doc.setLineWidth(0.25);
    doc.setDrawColor(...MIDGRAY);
    doc.line(ML, sectionY + 2, W - MR, sectionY + 2);

    // ─────────────────────────────────────────────────
    // 4.  Table  (booktabs style: \toprule \midrule \bottomrule)
    // ─────────────────────────────────────────────────
    const rows = payments.map(p => [
      p.id.slice(0, 10),
      p.description,
      this.categoryLabel(p.category),
      new Date(p.date).toLocaleDateString('fr-FR'),
      `${p.amount.toFixed(2)} TND`,
      this.statusLabel(p.status)
    ]);

    const tableStartY = sectionY + 6;

    // \toprule (drawn before autoTable call)
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.7);
    doc.line(ML, tableStartY, W - MR, tableStartY);

    autoTable(doc, {
      startY: tableStartY,
      head: [['Identifiant', 'Description', 'Catégorie', 'Date', 'Montant', 'Statut']],
      body: rows,
      // "plain" = no cell background colour, mimic LaTeX booktabs
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: BLACK,
        cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
        lineWidth: 0,
      },
      headStyles: {
        fontStyle: 'bold',
        fontSize: 9,
        textColor: BLACK,
        fillColor: WHITE,
        lineWidth: 0,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],    // very subtle LaTeX \rowcolor{gray!10}
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'italic', textColor: MIDGRAY },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 28, halign: 'right',  fontStyle: 'bold' },
        5: { cellWidth: 22, halign: 'center' },
      },
      didParseCell: (data) => {
        // Status column text colour
        if (data.column.index === 5 && data.section === 'body') {
          const status = payments[data.row.index]?.status;
          if (status === 'paid')    data.cell.styles.textColor = [0, 128, 0]    as any;
          if (status === 'pending') data.cell.styles.textColor = [180, 100, 0]  as any;
          if (status === 'late')    data.cell.styles.textColor = [180, 0, 0]    as any;
        }
      },
      // \midrule: draw a line below the header row using closure variables
      willDrawCell: (data) => {
        if (data.section === 'head' && data.column.index === 0) {
          const yMid = data.cell.y + data.cell.height;
          doc.setDrawColor(...RULE);
          doc.setLineWidth(0.4);
          doc.line(ML, yMid, W - MR, yMid);
        }
      },
      margin: { left: ML, right: MR },
    });

    // \bottomrule
    const finalY: number = (doc as any).lastAutoTable.finalY;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.7);
    doc.line(ML, finalY, W - MR, finalY);

    // ─────────────────────────────────────────────────
    // 5.  Summary section  (\section{Récapitulatif})
    // ─────────────────────────────────────────────────
    let curY = finalY + 10;

    // page break guard
    if (curY > H - 50) {
      doc.addPage();
      curY = 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BLACK);
    doc.text('2   Récapitulatif financier', ML, curY);
    doc.setDrawColor(...MIDGRAY);
    doc.setLineWidth(0.25);
    doc.line(ML, curY + 2, W - MR, curY + 2);
    curY += 8;

    // mini summary table (two-column, LaTeX tabular style)
    const sumItems: [string, string][] = [
      ['Nombre total de transactions', `${payments.length}`],
      ['Montant total',                `${total.toFixed(2)} TND`],
      ['Paiements effectués',          `${paid}`],
      ['Paiements en attente',         `${pending}`],
      ['Paiements en retard',          `${late}`],
    ];

    const sumStartY = curY;

    // \toprule for summary table
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.7);
    doc.line(ML, sumStartY, W - MR, sumStartY);

    autoTable(doc, {
      startY: sumStartY,
      head: [['Indicateur', 'Valeur']],
      body: sumItems,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        textColor: BLACK,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        lineWidth: 0,
      },
      headStyles: {
        fontStyle: 'bold',
        textColor: BLACK,
        fillColor: WHITE,
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { fontStyle: 'bold', halign: 'right' }
      },
      willDrawCell: (data) => {
        if (data.section === 'head' && data.column.index === 0) {
          const yMid = data.cell.y + data.cell.height;
          doc.setDrawColor(...RULE);
          doc.setLineWidth(0.4);
          doc.line(ML, yMid, W - MR, yMid);
        }
      },
      margin: { left: ML, right: MR },
    });

    const sumFinalY: number = (doc as any).lastAutoTable.finalY;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.7);
    doc.line(ML, sumFinalY, W - MR, sumFinalY);

    // ─────────────────────────────────────────────────
    // 6.  Footer on every page  (like LaTeX \pagestyle{fancy})
    // ─────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const fy = H - 10;
      doc.setDrawColor(...MIDGRAY);
      doc.setLineWidth(0.3);
      doc.line(ML, fy - 3, W - MR, fy - 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MIDGRAY);
      doc.text('MyPay — Document confidentiel. Réservé à usage personnel.', ML, fy);
      doc.text(`${i} / ${pageCount}`, W - MR, fy, { align: 'right' });
    }

    const filename = `MyPay_Paiements_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }

  private statusLabel(status: PaymentHistoryItem['status']): string {
    return { paid: 'Payé', pending: 'En attente', late: 'En retard' }[status];
  }

  private categoryLabel(category: PaymentHistoryItem['category']): string {
    return {
      card: 'Carte',
      bank: 'Banque',
      shopping: 'Shopping',
      subscription: 'Abonnement',
      insurance: 'Assurance'
    }[category] ?? category;
  }
}
