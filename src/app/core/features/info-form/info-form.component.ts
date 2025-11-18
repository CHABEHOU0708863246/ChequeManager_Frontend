// src/app/core/features/info-form/info-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChequeRow {
  id: number;
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

@Component({
  selector: 'app-info-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './info-form.component.html',
  styleUrls: ['./info-form.component.scss']
})
export class InfoFormComponent implements OnInit {
  rows: ChequeRow[] = [];
  banques: string[] = [
    'BNI',
    'ECOBANK',
    'SIB',
    'BICICI',
    'SGBCI',
    'BACI',
    'NSIA BANQUE'
  ];
  searchTerm: string = '';
  filteredRows: ChequeRow[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.addNewRow();
    // Charger les données sauvegardées depuis le localStorage si disponibles
    this.loadFromLocalStorage();
     this.filteredRows = this.rows;
  }

  onInputChange(row: ChequeRow): void {
    if (this.isRowPartiallyFilled(row)) {
      const isLastRow = this.rows[this.rows.length - 1].id === row.id;
      if (isLastRow) {
        this.addNewRow();
      }
    }
    // Sauvegarder automatiquement à chaque modification
    this.saveToLocalStorage();
  }

  isRowPartiallyFilled(row: ChequeRow): boolean {
    return !!(row.formuleChq || row.dateCheque || row.numeroCheque || row.banque);
  }

  addNewRow(): void {
  const newId = this.rows.length > 0
    ? Math.max(...this.rows.map(r => r.id)) + 1
    : 1;

  this.rows.push({
    id: newId,
    formuleChq: newId.toString(),
    dateCheque: '',
    numeroCheque: '',
    banque: '',
    codeAnalytique: '',
    libelleOrdre: '',
    natureOrdre: '',
    dateFacture: '',
    montantCheque: null
  });
}

  deleteRow(id: number): void {
    if (this.rows.length > 1) {
      this.rows = this.rows.filter(row => row.id !== id);
      this.saveToLocalStorage();
    }
  }

  navigateToImpression(): void {
    this.router.navigate(['/cheque-imprim']);
  }

  // Sauvegarder les données dans localStorage
  saveToLocalStorage(): void {
    // Filtrer les lignes vides avant de sauvegarder
    const validRows = this.rows.filter(row =>
      row.formuleChq || row.dateCheque || row.numeroCheque ||
      row.banque || row.libelleOrdre || row.montantCheque
    );
    localStorage.setItem('cheque_data', JSON.stringify(validRows));
  }

  // Charger les données depuis localStorage
  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('cheque_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData && parsedData.length > 0) {
          this.rows = parsedData;
          // Ajouter une ligne vide à la fin
          this.addNewRow();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
  }

  // Méthode pour sauvegarder manuellement (si besoin)
  saveData(): void {
    this.saveToLocalStorage();
    alert('Données sauvegardées avec succès !');
  }

  // Effacer toutes les données
  clearAllData(): void {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
      localStorage.removeItem('cheque_data');
      this.rows = [];
      this.addNewRow();
    }
  }

  filterRows(): void {
  if (!this.searchTerm.trim()) {
    this.filteredRows = this.rows;
    return;
  }

  const search = this.searchTerm.toLowerCase();
  this.filteredRows = this.rows.filter(row =>
    row.numeroCheque.toLowerCase().includes(search) ||
    row.banque.toLowerCase().includes(search) ||
    row.libelleOrdre.toLowerCase().includes(search) ||
    row.natureOrdre.toLowerCase().includes(search) ||
    row.dateFacture.includes(search) ||
    (row.montantCheque && row.montantCheque.toString().includes(search))
  );
}

get displayedRows(): ChequeRow[] {
  return this.searchTerm.trim() ? this.filteredRows : this.rows;
}
}
