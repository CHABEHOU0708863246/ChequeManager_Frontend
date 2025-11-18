// src/app/core/features/cheque-imprim/cheque-imprim.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChequeData {
  formuleChq: string;
  dateCheque: string;
  numeroCheque: string;
  banque: string;
  codeAnalytique: string;
  libelleOrdre: string;
  natureOrdre: string;
  dateFacture: string;
  montantCheque: number | null;
}

interface BankTemplate {
  name: string;
  positions: {
    beneficiaire: { top: string; left: string; width: string };
    montantChiffres: { top: string; right: string };
    montantLettres: { top: string; left: string; width: string };
    date: { top: string; right: string };
    lieu: { top: string; left: string };
  };
}

@Component({
  selector: 'app-cheque-imprim',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cheque-imprim.component.html',
  styleUrls: ['./cheque-imprim.component.scss']
})
export class ChequeImprimComponent implements OnInit {
  formuleChqId: string = '';
  chequeData: ChequeData | null = null;
  montantEnLettres: string = '';
  lieu: string = 'ABOISSO'; // Valeur par défaut

  bankTemplates: { [key: string]: BankTemplate } = {
    'BNI': {
      name: 'Banque Nationale d\'Investissement',
      positions: {
        beneficiaire: { top: '3.2cm', left: '1.2cm', width: '6cm' },
        montantChiffres: { top: '3.8cm', right: '2cm' },
        montantLettres: { top: '2.5cm', left: '4cm', width: '11cm' },
        date: { top: '3.8cm', right: '8cm' },
        lieu: { top: '5.8cm', left: '7cm' }
      }
    },
    'ECOBANK': {
      name: 'Ecobank',
      positions: {
        beneficiaire: { top: '3.8cm', left: '1.2cm', width: '5.5cm' },
        montantChiffres: { top: '4.5cm', right: '1.5cm' },
        montantLettres: { top: '3cm', left: '4cm', width: '10cm' },
        date: { top: '4.2cm', right: '7.5cm' },
        lieu: { top: '5.5cm', left: '6.5cm' }
      }
    },
    'SIB': {
      name: 'Société Ivoirienne de Banque',
      positions: {
        beneficiaire: { top: '3.5cm', left: '1.2cm', width: '6cm' },
        montantChiffres: { top: '4cm', right: '1.8cm' },
        montantLettres: { top: '2.2cm', left: '3.5cm', width: '11cm' },
        date: { top: '4cm', right: '8.5cm' },
        lieu: { top: '5.2cm', left: '1.5cm' }
      }
    },
    'SGBCI': {
      name: 'Société Générale Côte d\'Ivoire',
      positions: {
        beneficiaire: { top: '3.8cm', left: '1.5cm', width: '5.8cm' },
        montantChiffres: { top: '4.3cm', right: '1.5cm' },
        montantLettres: { top: '2.5cm', left: '4cm', width: '10.5cm' },
        date: { top: '4.3cm', right: '8cm' },
        lieu: { top: '5cm', left: '1.5cm' }
      }
    },
    'BACI': {
      name: 'Banque Atlantique Côte d\'Ivoire',
      positions: {
        beneficiaire: { top: '3.5cm', left: '1.2cm', width: '6cm' },
        montantChiffres: { top: '4.2cm', right: '1.8cm' },
        montantLettres: { top: '2.3cm', left: '3.8cm', width: '11cm' },
        date: { top: '4.2cm', right: '8.2cm' },
        lieu: { top: '5.5cm', left: '1.2cm' }
      }
    },
    'BICICI': {
      name: 'BICICI',
      positions: {
        beneficiaire: { top: '3.6cm', left: '1.3cm', width: '5.8cm' },
        montantChiffres: { top: '4.1cm', right: '1.7cm' },
        montantLettres: { top: '2.4cm', left: '3.7cm', width: '10.8cm' },
        date: { top: '4.1cm', right: '8.3cm' },
        lieu: { top: '5.3cm', left: '1.4cm' }
      }
    },
    'NSIA BANQUE': {
      name: 'NSIA Banque',
      positions: {
        beneficiaire: { top: '3.4cm', left: '1.3cm', width: '6cm' },
        montantChiffres: { top: '3.9cm', right: '1.9cm' },
        montantLettres: { top: '2.3cm', left: '3.6cm', width: '11cm' },
        date: { top: '3.9cm', right: '8.4cm' },
        lieu: { top: '5.4cm', left: '1.3cm' }
      }
    }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  loadChequeData(): void {
    // Charger depuis localStorage (données du formulaire info-form)
    const savedData = localStorage.getItem('cheque_data');

    if (!savedData) {
      alert('Aucune donnée trouvée. Veuillez d\'abord remplir le formulaire.');
      this.router.navigate(['/info-form']);
      return;
    }

    try {
      const allCheques: ChequeData[] = JSON.parse(savedData);

      // Rechercher le chèque par ID (formuleChq)
      const foundCheque = allCheques.find(c => c.formuleChq === this.formuleChqId);

      if (foundCheque) {
        this.chequeData = foundCheque;

        // Convertir le montant en lettres si présent
        if (this.chequeData.montantCheque) {
          this.montantEnLettres = this.convertirMontantEnLettres(this.chequeData.montantCheque);
        }
      } else {
        alert(`Aucun chèque trouvé avec l'ID: ${this.formuleChqId}`);
        this.chequeData = null;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données.');
    }
  }

  convertirMontantEnLettres(montant: number): string {
    if (montant === 0) return 'ZERO FRANCS CFA';

    let resultat = '';
    const millions = Math.floor(montant / 1000000);
    const milliers = Math.floor((montant % 1000000) / 1000);
    const centaines = montant % 1000;

    // Millions
    if (millions > 0) {
      if (millions === 1) {
        resultat += 'UN MILLION ';
      } else {
        resultat += this.convertirCentaines(millions) + ' MILLIONS ';
      }
    }

    // Milliers
    if (milliers > 0) {
      if (milliers === 1) {
        resultat += 'MILLE ';
      } else {
        resultat += this.convertirCentaines(milliers) + ' MILLE ';
      }
    }

    // Centaines
    if (centaines > 0) {
      resultat += this.convertirCentaines(centaines) + ' ';
    }

    return resultat.trim() + ' FRANCS CFA';
  }

  private convertirCentaines(n: number): string {
    const unites = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF'];
    const dizaines = ['', '', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE', 'QUATRE-VINGT', 'QUATRE-VINGT'];
    const special = ['DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];

    let resultat = '';
    const cent = Math.floor(n / 100);
    const dix = Math.floor((n % 100) / 10);
    const un = n % 10;

    // Centaines
    if (cent > 0) {
      if (cent === 1) {
        resultat += 'CENT ';
      } else {
        resultat += unites[cent] + ' CENT ';
      }
    }

    // Dizaines et unités
    if (dix === 1) {
      resultat += special[un] + ' ';
    } else if (dix === 7 || dix === 9) {
      if (un === 0) {
        resultat += dizaines[dix] + ' ';
      } else {
        resultat += dizaines[dix] + '-' + (dix === 7 ? special[un] : (un === 1 ? 'ONZE' : special[un])) + ' ';
      }
    } else {
      if (dix > 0) {
        resultat += dizaines[dix];
        if (un > 0) {
          resultat += (dix > 1 && un === 1) ? ' ET ' : '-';
        } else {
          resultat += ' ';
        }
      }
      if (un > 0) {
        resultat += unites[un] + ' ';
      }
    }

    return resultat.trim();
  }

  getCurrentTemplate(): BankTemplate | null {
    if (!this.chequeData) return null;
    return this.bankTemplates[this.chequeData.banque] || null;
  }

  print(): void {
    window.print();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatMontant(montant: number | null): string {
    if (!montant) return '0';
    return montant.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  goBack(): void {
    this.router.navigate(['/info-form']);
  }
}
