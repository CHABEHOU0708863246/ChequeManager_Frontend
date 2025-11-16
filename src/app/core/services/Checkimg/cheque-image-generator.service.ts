import { Injectable } from '@angular/core';

// Interface pour les données de chèque (non modifiée)
export interface ChequeData {
  bankCode: string;
  chequeNumber: string;
  serieNumber?: string;
  beneficiaryName: string;
  amountInNumbers: number;
  amountInLetters: string;
  issueDate: string;
  issuePlace: string;
  accountHolderName: string;
  accountNumber: string;
  agencyName: string;
  agencyLocation: string;
  cmc7Code: string;
  bankName: string;
  bankGroup?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChequeImageGeneratorService {

  /**
   * Génère l'image du chèque
   */
  async generateChequeImage(data: ChequeData): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Dimensions
    const width = 850;
    const height = 380;
    canvas.width = width;
    canvas.height = height;

    // Sélection du template selon la banque
    switch (data.bankCode.toUpperCase()) {
      case 'SIB':
        this.drawSIBCheque(ctx, width, height, data);
        break;
      case 'SGCI':
        this.drawSGCICheque(ctx, width, height, data);
        break;
      case 'ECO': // ECOBANK CÔTE D'IVOIRE
        this.drawEcobankCheque(ctx, width, height, data);
        break;
      case 'ATL': // BANQUE ATLANTIQUE
        this.drawAtlantiqueCheque(ctx, width, height, data);
        break;
      case 'BNI': // BANQUE NATIONALE D'INVESTISSEMENT
        this.drawBniCheque(ctx, width, height, data);
        break;
      default:
        this.drawGenericCheque(ctx, width, height, data);
        break;
    }

    // Retourner l'image en base64
    return canvas.toDataURL('image/png');
  }

  // --- TEMPLATES EXISTANTS ---

  /**
   * Template SIB
   */
  private drawSIBCheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Fond dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#d8d8d8');
    gradient.addColorStop(1, '#c5c5c5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Bordure
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    let y = 25;

    // HEADER
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.fillText('Chèque N°', 20, y);
    ctx.font = 'bold 11px Arial';
    ctx.fillText(data.chequeNumber, 75, y);

    // Logo et nom banque (centre)
    this.drawSIBLogo(ctx, width / 2 - 70, y - 10);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.bankName, width / 2, y + 20); // Utiliser data.bankName
    if (data.bankGroup) {
      ctx.font = '9px Arial';
      ctx.fillStyle = '#555';
      ctx.fillText(data.bankGroup, width / 2, y + 48);
    }

    // F CFA
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, y - 5, 60, 20);
    ctx.fillText('F CFA', width - 70, y + 8);

    // Watermark
    ctx.save();
    ctx.translate(width / 2, 150);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.bankCode, 0, 0);
    ctx.restore();
    ctx.textAlign = 'left';

    y = 90;

    // PAYEZ CONTRE CE CHÈQUE
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('PAYEZ CONTRE CE CHÈQUE', 20, y);
    ctx.font = '8px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Sauf à l\'ordre d\'une banque ou d\'un établissement assimilé', 20, y + 12);

    ctx.font = 'italic 9px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Non endossable', 20, y + 28);

    // Ligne montant en lettres
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, y + 28);
    ctx.lineTo(width - 20, y + 28);
    ctx.stroke();

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Somme en toutes lettres', width - 140, y + 20);

    if (data.amountInLetters) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#000';
      const maxWidth = width - 145;
      this.wrapText(ctx, data.amountInLetters, 125, y + 25, maxWidth, 12);
    }

    y = 130;

    // A L'ORDRE DE
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('A L\'ORDRE DE', 20, y);

    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(20, y + 8);
    ctx.lineTo(width - 20, y + 8);
    ctx.stroke();

    if (data.beneficiaryName) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#000';
      ctx.fillText(data.beneficiaryName.toUpperCase(), 25, y + 5);
    }

    y = 160;

    // SECTION PRINCIPALE - Agence
    ctx.strokeStyle = '#999';
    ctx.strokeRect(20, y, 180, 100);

    ctx.font = 'bold 8px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('PAYABLE À L\'AGENCE DE', 28, y + 15);

    ctx.font = '9px Arial';
    const agencyLines = this.wrapTextArray(data.agencyName, 20);
    agencyLines.forEach((line, idx) => {
      ctx.fillText(line, 28, y + 35 + (idx * 12));
    });

    ctx.font = 'bold 9px Arial';
    ctx.fillText(data.agencyLocation, 28, y + 85);

    // Compte
    const centerX = 220;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(centerX, y, 420, 100);
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(centerX, y, 420, 100);

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('N° de Compte', centerX + 10, y + 15);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(data.accountNumber, centerX + 10, y + 35);

    ctx.font = 'bold 9px Arial';
    const holderLines = this.wrapTextArray(data.accountHolderName, 35);
    holderLines.forEach((line, idx) => {
      ctx.fillText(line, centerX + 10, y + 55 + (idx * 11));
    });

    // Date et Signature
    const rightX = 660;
    ctx.strokeStyle = '#999';
    ctx.strokeRect(rightX, y, 170, 40);
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('LE', rightX + 10, y + 15);

    if (data.issueDate) {
      ctx.font = 'bold 11px Arial';
      const date = new Date(data.issueDate);
      ctx.fillText(data.issuePlace, rightX + 10, y + 30);
      ctx.fillText(date.toLocaleDateString('fr-FR'), rightX + 100, y + 30);
    }

    ctx.strokeRect(rightX, y + 50, 170, 50);

    // Montant en chiffres
    if (data.amountInNumbers > 0) {
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      const amount = data.amountInNumbers.toLocaleString('fr-FR');
      ctx.fillText(amount, width - 30, y - 10);
      ctx.textAlign = 'left';
    }

    // BANDE CMC7
    const cmc7Y = height - 28;
    const cmc7Gradient = ctx.createLinearGradient(0, cmc7Y, 0, height);
    cmc7Gradient.addColorStop(0, '#e8e8e8');
    cmc7Gradient.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = cmc7Gradient;
    ctx.fillRect(0, cmc7Y, width, 28);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cmc7Y);
    ctx.lineTo(width, cmc7Y);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText(data.cmc7Code, 20, cmc7Y + 19);
  }

  /**
   * Template SGCI
   */
  private drawSGCICheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Fond dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e8e8e8');
    gradient.addColorStop(1, '#d4d4d4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    let y = 40;

    // Logo SGCI
    this.drawSGCILogo(ctx, 20, y);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText('SOCIETE GENERALE', 80, y + 15);
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillText('COTE D\'IVOIRE', 80, y + 32);

    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#333';
    ctx.fillText('Payez contre ce chèque', 80, y + 50);

    // Série et numéro
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    const serieText = data.serieNumber || `Chèque N° ${data.chequeNumber}`;
    ctx.fillText(`Série ${serieText}`, width / 2, y);

    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Courier New"';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, y, 60, 20);
    ctx.fillText('F CFA', width - 25, y + 14);
    ctx.textAlign = 'left';

    y = 140;

    // A l'ordre de
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#000';
    ctx.fillText('A l\'ordre de', 20, y);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    if (data.beneficiaryName) {
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillStyle = '#000';
      ctx.fillText(data.beneficiaryName.toUpperCase(), 125, y + 3);
    }

    ctx.beginPath();
    ctx.moveTo(120, y + 20);
    ctx.lineTo(width - 20, y + 20);
    ctx.stroke();

    if (data.amountInLetters) {
      ctx.font = 'bold 10px "Courier New"';
      this.wrapText(ctx, data.amountInLetters, 125, y + 18, width - 145, 12);
    }

    y = 210;

    // Date
    if (data.issueDate) {
      const date = new Date(data.issueDate);
      ctx.font = 'bold 11px "Courier New"';
      ctx.fillStyle = '#000';
      ctx.fillText(data.issuePlace, 20, y);
      ctx.fillText(`Le : ${date.toLocaleDateString('fr-FR')}`, 20, y + 15);
    }

    // Lieu et compte
    const accountX = 250;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(accountX, y - 10, 350, 80);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(accountX, y - 10, 350, 80);

    ctx.font = 'bold 12px "Courier New"';
    ctx.fillStyle = '#000';
    ctx.fillText('Compte N° ' + data.accountNumber, accountX + 10, y + 10);

    ctx.font = 'bold 9px "Courier New"';
    const holderLines = this.wrapTextArray(data.accountHolderName, 30);
    holderLines.forEach((line, idx) => {
      ctx.fillText(line, accountX + 10, y + 30 + (idx * 11));
    });

    // Signature box
    ctx.strokeStyle = '#999';
    ctx.strokeRect(620, y + 10, 120, 60);
    ctx.font = '7px "Courier New"';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Signature du tireur', 620 + 60, y + 75);
    ctx.textAlign = 'left';

    // Montant
    if (data.amountInNumbers > 0) {
      ctx.font = 'bold 18px "Courier New"';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      const amount = data.amountInNumbers.toLocaleString('fr-FR');
      ctx.fillText(amount, width - 30, y - 20);
      ctx.textAlign = 'left';
    }

    // BANDE CMC7
    const cmc7Y = height - 25;
    const cmc7Gradient = ctx.createLinearGradient(0, cmc7Y, 0, height);
    cmc7Gradient.addColorStop(0, '#f5f5f5');
    cmc7Gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = cmc7Gradient;
    ctx.fillRect(0, cmc7Y, width, 25);

    ctx.strokeStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(0, cmc7Y);
    ctx.lineTo(width, cmc7Y);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText(data.cmc7Code, 20, cmc7Y + 17);
  }

  // --- NOUVEAUX TEMPLATES ---

  /**
   * Template ECOBANK CÔTE D'IVOIRE (ECO)
   */
  private drawEcobankCheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Fond Blanc-Gris clair
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#fdfefe');
    gradient.addColorStop(1, '#f9f9fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    let y = 30;
    const orangeColor = '#e8751a';
    const darkGray = '#333';

    // TOP BAR
    // Logo et nom banque (centre-gauche)
    this.drawEcobankLogo(ctx, 20, y);
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(data.bankName.toUpperCase(), 80, y + 10);
    ctx.font = 'italic 9px Arial';
    ctx.fillText('The Pan African Bank', 80, y + 25);

    // Série et numéro (gauche)
    ctx.font = '9px Arial';
    ctx.fillStyle = darkGray;
    ctx.textAlign = 'left';
    ctx.fillText('CHÈQUE N°', 20, y + 55);
    ctx.font = 'bold 18px Arial';
    ctx.fillText(data.chequeNumber, 20, y + 70);

    // F CFA (droite)
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px Arial';
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, y, 60, 20);
    ctx.fillText('F CFA', width - 25, y + 14);

    // Montant en chiffres (à droite, au dessus de la date)
    if (data.amountInNumbers > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = orangeColor;
      ctx.fillText(data.amountInNumbers.toLocaleString('fr-FR'), width - 30, y + 65);
      ctx.font = '7px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Montant en chiffres', width - 30, y + 75);
    }

    ctx.textAlign = 'left';

    y = 110;

    // PAYEZ CONTRE CE CHÈQUE
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('PAYEZ CONTRE CE CHÈQUE', 20, y);
    ctx.font = '6px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Sauf à l\'ordre d\'une banque ou d\'un établissement assimilé', 20, y + 10);
    ctx.fillText('NON NÉGOCIABLE', width - 100, y + 10);

    y += 25;

    // A L'ORDRE DE
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('À L\'ORDRE DE', 20, y);

    // Ligne bénéficiaire
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    if (data.beneficiaryName) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = darkGray;
      ctx.fillText(data.beneficiaryName.toUpperCase(), 115, y + 3);
    }

    y += 20;

    // Montant en lettres
    ctx.strokeStyle = darkGray;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Somme en toutes lettres', 110, y - 5);

    if (data.amountInLetters) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = darkGray;
      const maxWidth = width - 145;
      this.wrapText(ctx, data.amountInLetters, 115, y + 2, maxWidth, 12);
    }

    y = 220;

    // Lieu et Date
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('FAIT À', 20, y);
    ctx.fillText('LE', 200, y);

    // Ligne Lieu & Date
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y + 5);
    ctx.lineTo(190, y + 5);
    ctx.moveTo(220, y + 5);
    ctx.lineTo(350, y + 5);
    ctx.stroke();

    if (data.issueDate) {
      const date = new Date(data.issueDate);
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = darkGray;
      ctx.fillText(data.issuePlace, 65, y + 3);
      ctx.fillText(date.toLocaleDateString('fr-FR'), 225, y + 3);
    }

    y = 250;

    // Agence et Détails Compte
    const boxY = y;

    // Agence (Gauche)
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(20, boxY, 250, 80);
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 8px Arial';
    ctx.fillText('AGENCE DE : ' + data.agencyName, 25, boxY + 15);
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    this.wrapText(ctx, data.agencyLocation, 25, boxY + 30, 240, 9);

    // Détails Compte et Titulaire (Centre)
    const centerX = 290;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(centerX, boxY, 250, 80);
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(centerX, boxY, 250, 80);

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('N° de Compte', centerX + 5, boxY + 15);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText(data.accountNumber, centerX + 5, boxY + 35);

    ctx.font = 'bold 9px Arial';
    const holderLines = this.wrapTextArray(data.accountHolderName, 25);
    holderLines.forEach((line, idx) => {
      ctx.fillText(line, centerX + 5, boxY + 55 + (idx * 11));
    });

    // Signature (Droite)
    const rightX = 560;
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(rightX, boxY + 5, 270, 70);
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText('Signature(s) du Tireur(s)', rightX + 265, boxY + 70);

    // BANDE CMC7
    const cmc7Y = height - 25;
    this.drawCMC7Band(ctx, width, height, cmc7Y, data.cmc7Code);
  }

  /**
   * Template BANQUE ATLANTIQUE (ATL)
   */
  private drawAtlantiqueCheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Fond Blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    let y = 30;
    const blueColor = '#1e88e5';
    const darkGray = '#333';

    // TOP BAR
    // Logo et nom banque (gauche)
    this.drawAtlantiqueLogo(ctx, 20, y);
    ctx.fillStyle = blueColor;
    ctx.font = 'bold 18px Arial';
    ctx.fillText('BANQUE ATLANTIQUE', 80, y + 15);
    ctx.font = '10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('CÔTE D\'IVOIRE', 80, y + 30);

    // Chèque N° (haut droite)
    ctx.textAlign = 'right';
    ctx.font = '9px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('CHÈQUE N°', width - 80, y + 5);
    ctx.font = 'bold 16px Arial';
    ctx.fillText(data.chequeNumber, width - 20, y + 25);

    // F CFA et Montant (milieu droite)
    ctx.font = 'bold 13px Arial';
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, y + 40, 60, 20);
    ctx.fillText('F CFA', width - 25, y + 54);

    if (data.amountInNumbers > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = blueColor;
      ctx.fillText(data.amountInNumbers.toLocaleString('fr-FR'), width - 90, y + 40);
      ctx.font = '7px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Montant en chiffres', width - 90, y + 50);
    }

    ctx.textAlign = 'left';

    y = 110;

    // PAYEZ CONTRE CE CHÈQUE
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('PAYEZ CONTRE CE CHÈQUE', 20, y);
    ctx.font = '6px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('NON BARRÉ / NON ENDOSSABLE', width - 150, y);

    y += 15;

    // A L'ORDRE DE
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('À L\'ORDRE DE', 20, y);

    // Ligne bénéficiaire
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    if (data.beneficiaryName) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = darkGray;
      ctx.fillText(data.beneficiaryName.toUpperCase(), 115, y + 3);
    }

    y += 20;

    // Montant en lettres
    ctx.strokeStyle = darkGray;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Somme en toutes lettres', 110, y - 5);

    if (data.amountInLetters) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = darkGray;
      const maxWidth = width - 145;
      this.wrapText(ctx, data.amountInLetters, 115, y + 2, maxWidth, 12);
    }

    y = 220;

    // Agence et Lieu/Date
    const boxY = y;

    // Agence (Gauche)
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(20, boxY, 250, 80);
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 9px Arial';
    ctx.fillText('AGENCE ÉMETTRICE', 25, boxY + 15);
    ctx.font = '8px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText(data.agencyName, 25, boxY + 30);
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    this.wrapText(ctx, data.agencyLocation, 25, boxY + 45, 240, 9);

    // Détails Compte (Centre)
    const centerX = 290;
    ctx.fillStyle = 'rgba(240, 240, 255, 0.5)';
    ctx.fillRect(centerX, boxY, 250, 80);
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(centerX, boxY, 250, 80);

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('N° de Compte / RIB', centerX + 5, boxY + 15);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText(data.accountNumber, centerX + 5, boxY + 35);

    ctx.font = 'bold 9px Arial';
    const holderLines = this.wrapTextArray(data.accountHolderName, 25);
    holderLines.forEach((line, idx) => {
      ctx.fillText(line, centerX + 5, boxY + 55 + (idx * 11));
    });

    // Signature et Date (Droite)
    const rightX = 560;

    // Lieu et Date
    ctx.font = 'bold 9px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('FAIT À : ' + data.issuePlace, rightX, boxY + 15);
    if (data.issueDate) {
      const date = new Date(data.issueDate);
      ctx.fillText('LE : ' + date.toLocaleDateString('fr-FR'), rightX + 150, boxY + 15);
    }

    // Signature Area
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(rightX, boxY + 25, 270, 50);
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText('Signature du Titulaire', rightX + 265, boxY + 70);

    // BANDE CMC7
    const cmc7Y = height - 25;
    this.drawCMC7Band(ctx, width, height, cmc7Y, data.cmc7Code);
  }

  /**
   * Template BANQUE NATIONALE D'INVESTISSEMENT (BNI)
   */
  private drawBniCheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Fond Blanc-Vert clair
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f0fff0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    let y = 30;
    const greenColor = '#27ae60';
    const darkGray = '#333';

    // TOP BAR
    // Logo et nom banque (gauche)
    this.drawBniLogo(ctx, 20, y);
    ctx.fillStyle = greenColor;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('BANQUE NATIONALE D\'INVESTISSEMENT', 80, y + 15);
    ctx.font = '10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('La Banque qui investit', 80, y + 30);

    // Chèque N° et Montant (droite)
    ctx.textAlign = 'right';
    ctx.font = '9px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('CHÈQUE N°', width - 80, y + 5);
    ctx.font = 'bold 18px Arial';
    ctx.fillText(data.chequeNumber, width - 20, y + 25);

    // F CFA
    ctx.font = 'bold 13px Arial';
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 80, y + 40, 60, 20);
    ctx.fillText('F CFA', width - 25, y + 54);

    if (data.amountInNumbers > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = greenColor;
      ctx.fillText(data.amountInNumbers.toLocaleString('fr-FR'), width - 90, y + 40);
      ctx.font = '7px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Montant en chiffres', width - 90, y + 50);
    }

    ctx.textAlign = 'left';

    y = 120;

    // PAYEZ CONTRE CE CHÈQUE
    ctx.fillStyle = darkGray;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('PAYEZ CONTRE CE CHÈQUE', 20, y);
    ctx.font = '6px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Sauf à l\'ordre d\'une banque ou d\'un établissement assimilé', 20, y + 10);

    y += 20;

    // A L'ORDRE DE
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('À L\'ORDRE DE', 20, y);

    // Ligne bénéficiaire
    ctx.strokeStyle = darkGray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    if (data.beneficiaryName) {
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = darkGray;
      ctx.fillText(data.beneficiaryName.toUpperCase(), 115, y + 3);
    }

    y += 20;

    // Montant en lettres
    ctx.strokeStyle = darkGray;
    ctx.beginPath();
    ctx.moveTo(110, y + 5);
    ctx.lineTo(width - 20, y + 5);
    ctx.stroke();

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Somme en toutes lettres', 110, y - 5);

    if (data.amountInLetters) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = darkGray;
      const maxWidth = width - 145;
      this.wrapText(ctx, data.amountInLetters, 115, y + 2, maxWidth, 12);
    }

    y = 220;

    // Détails Compte et Titulaire (Gauche)
    const boxY = y;
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(20, boxY, 300, 80);

    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('N° de Compte BNI', 25, boxY + 15);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText(data.accountNumber, 25, boxY + 35);

    ctx.font = 'bold 9px Arial';
    const holderLines = this.wrapTextArray(data.accountHolderName, 30);
    holderLines.forEach((line, idx) => {
      ctx.fillText(line, 25, boxY + 55 + (idx * 11));
    });

    // Agence, Lieu et Date (Centre et Droite)
    const centerX = 340;

    // Agence
    ctx.font = 'bold 9px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('AGENCE : ' + data.agencyName, centerX, boxY + 15);

    ctx.font = '8px Arial';
    ctx.fillStyle = '#666';
    this.wrapText(ctx, data.agencyLocation, centerX, boxY + 30, 200, 10);

    // Lieu et Date
    const rightX = 580;
    ctx.font = 'bold 9px Arial';
    ctx.fillStyle = darkGray;
    ctx.fillText('FAIT À : ' + data.issuePlace, rightX, boxY + 15);
    if (data.issueDate) {
      const date = new Date(data.issueDate);
      ctx.fillText('LE : ' + date.toLocaleDateString('fr-FR'), rightX, boxY + 30);
    }

    // Signature Area
    ctx.strokeStyle = darkGray;
    ctx.strokeRect(580, boxY + 40, 250, 40);
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText('Signature du Tiré', 580 + 245, boxY + 75);

    // BANDE CMC7
    const cmc7Y = height - 25;
    this.drawCMC7Band(ctx, width, height, cmc7Y, data.cmc7Code);
  }

  /**
   * Template générique (utilise le SIB comme base par défaut)
   */
  private drawGenericCheque(ctx: CanvasRenderingContext2D, width: number, height: number, data: ChequeData): void {
    // Utiliser le template SIB comme template générique par défaut
    this.drawSIBCheque(ctx, width, height, { ...data, bankName: data.bankName || 'Banque Générique' });
  }

  // --- HELPERS DE DESSIN ---

  private drawCMC7Band(ctx: CanvasRenderingContext2D, width: number, height: number, cmc7Y: number, cmc7Code: string): void {
    const cmc7Gradient = ctx.createLinearGradient(0, cmc7Y, 0, height);
    cmc7Gradient.addColorStop(0, '#e8e8e8');
    cmc7Gradient.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = cmc7Gradient;
    ctx.fillRect(0, cmc7Y, width, height - cmc7Y);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cmc7Y);
    ctx.lineTo(width, cmc7Y);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText(cmc7Code, 20, cmc7Y + 19);
  }

  // Logos existants
  private drawSIBLogo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#666';
    ctx.fillRect(x, y, 80, 50);

    const mountains = [
      { x: x + 20, w: 12, h: 25 },
      { x: x + 36, w: 12, h: 25 },
      { x: x + 52, w: 12, h: 25 }
    ];

    mountains.forEach((m, idx) => {
      ctx.fillStyle = idx === 0 ? '#999' : idx === 1 ? '#888' : '#777';
      ctx.beginPath();
      ctx.moveTo(m.x, y + 50);
      ctx.lineTo(m.x + m.w / 2, y + 50 - m.h);
      ctx.lineTo(m.x + m.w, y + 50);
      ctx.closePath();
      ctx.fill();
    });
  }

  private drawSGCILogo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 45, 45);

    const gradient = ctx.createLinearGradient(x, y, x + 30, y + 30);
    gradient.addColorStop(0, '#e60000');
    gradient.addColorStop(1, '#c00000');
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 7.5, y + 7.5, 30, 30);
  }

  // Nouveaux Logos
  private drawEcobankLogo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const size = 50;
    // Cercle extérieur orange
    const orange = '#e8751a';
    const dark = '#333';

    // Cercle 1
    ctx.fillStyle = orange;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Cercle intérieur (noir) pour l'effet
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Lettre E stylisée (simple triangle ou forme)
    ctx.fillStyle = orange;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size / 2 - 10);
    ctx.lineTo(x + size / 2 - 10, y + size / 2 + 10);
    ctx.lineTo(x + size / 2 + 10, y + size / 2 + 10);
    ctx.closePath();
    ctx.fill();
  }

  private drawAtlantiqueLogo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const size = 50;
    const blue = '#1e88e5';
    const darkBlue = '#1565c0';

    // Fond carré bleu
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, blue);
    gradient.addColorStop(1, darkBlue);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size, size);

    // Vague blanche (simple courbe)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.bezierCurveTo(x + size / 4, y + size / 4, x + size * 3 / 4, y + size * 3 / 4, x + size, y + size / 2);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();
  }

  private drawBniLogo(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const size = 50;
    const green = '#27ae60';

    // Carré vert foncé
    ctx.fillStyle = '#229954';
    ctx.fillRect(x, y, size, size);

    // Forme BNI (simple losange vert clair)
    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size, y + size / 2);
    ctx.lineTo(x + size / 2, y + size);
    ctx.lineTo(x, y + size / 2);
    ctx.closePath();
    ctx.fill();

    // Petit cercle blanc au centre
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helpers pour le texte (non modifiés)
  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  private wrapTextArray(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxLength && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim().length > 0) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}
