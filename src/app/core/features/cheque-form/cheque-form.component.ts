import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControlDirective, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
}

@Component({
  selector: 'app-cheque-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, ],
  templateUrl: './cheque-form.component.html',
  styleUrls: ['./cheque-form.component.scss']
})
export class ChequeFormComponent implements OnInit {
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

  ngOnInit(): void {
    this.addNewRow();
  }

  onInputChange(row: ChequeRow): void {
    if (this.isRowPartiallyFilled(row)) {
      const isLastRow = this.rows[this.rows.length - 1].id === row.id;
      if (isLastRow) {
        this.addNewRow();
      }
    }
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
      formuleChq: '',
      dateCheque: '',
      numeroCheque: '',
      banque: '',
      codeAnalytique: '',
      libelleOrdre: '',
      natureOrdre: '',
      dateFacture: ''
    });
  }

  deleteRow(id: number): void {
    if (this.rows.length > 1) {
      this.rows = this.rows.filter(row => row.id !== id);
    }
  }

  // Méthode pour récupérer les données via formuleChq (à implémenter selon votre backend)
  loadChequeData(formuleChq: string): void {
    // Ici vous pourrez appeler votre service pour récupérer les données
    // Exemple: this.chequeService.getChequeByFormule(formuleChq).subscribe(...)
  }
}
