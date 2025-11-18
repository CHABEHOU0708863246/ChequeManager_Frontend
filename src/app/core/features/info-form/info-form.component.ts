// Imports Angular nécessaires
import { Component, OnInit } from '@angular/core';  // Décorateurs de base
import { CommonModule } from '@angular/common';     // Directives comme *ngFor, *ngIf
import { FormsModule } from '@angular/forms';       // Pour [(ngModel)] - liaison bidirectionnelle
import { Router } from '@angular/router';           // Navigation entre pages

// Structure d'une ligne de chèque (modèle de données)
interface ChequeRow {
  id: number;                    // Identifiant unique
  formuleChq: string;            // Numéro auto-généré
  dateCheque: string;            // Date au format ISO
  numeroCheque: string;          // Numéro du chèque
  banque: string;                // Nom de la banque
  codeAnalytique: string;        // Code comptable
  libelleOrdre: string;          // Nom du bénéficiaire
  natureOrdre: string;           // Description du paiement
  dateFacture: string;           // Date de facture
  montantCheque: number | null;  // Montant (null si vide)
}

@Component({
  selector: 'app-info-form',           // Balise HTML pour utiliser ce composant
  standalone: true,                    // Composant indépendant (Angular 14+)
  imports: [FormsModule, CommonModule], // Modules nécessaires importés
  templateUrl: './info-form.component.html',  // Fichier HTML lié
  styleUrls: ['./info-form.component.scss']   // Fichier CSS lié
})
export class InfoFormComponent implements OnInit {
  rows: ChequeRow[] = [];              // Tableau de toutes les lignes
  banques: string[] = [
    'BNI',
    'ECOBANK',
    'SIB',
    'BICICI',
    'SGBCI',
    'BACI',
    'NSIA BANQUE'
  ];           // Liste des banques disponibles
  searchTerm: string = '';             // Texte de recherche
  filteredRows: ChequeRow[] = [];      // Lignes filtrées par recherche

  constructor(private router: Router) {} // Injection du service de navigation

  ngOnInit(): void {                   // Exécuté au chargement du composant
    this.addNewRow();                  // Ajoute ligne vide initiale
    this.loadFromLocalStorage();       // Charge données sauvegardées
    this.filteredRows = this.rows;     // Initialise filtre
  }

  onInputChange(row: ChequeRow): void {  // Appelé à chaque modification
    if (this.isRowPartiallyFilled(row)) { // Si ligne commence à être remplie
      const isLastRow = this.rows[this.rows.length - 1].id === row.id;
      if (isLastRow) {                    // Si c'est la dernière ligne
        this.addNewRow();                 // Ajoute nouvelle ligne vide
      }
    }
    this.saveToLocalStorage();            // Sauvegarde auto dans navigateur
  }

  isRowPartiallyFilled(row: ChequeRow): boolean { // Vérifie si ligne contient données
    return !!(row.formuleChq || row.dateCheque || row.numeroCheque || row.banque);
  }

  addNewRow(): void {                     // Ajoute ligne vide
    const newId = this.rows.length > 0    // Calcule nouvel ID
      ? Math.max(...this.rows.map(r => r.id)) + 1  // ID = max + 1
      : 1;                                // Ou 1 si tableau vide

    this.rows.push({                      // Ajoute nouvelle ligne
      id: newId,
      formuleChq: newId.toString(),       // ID devient formule
      dateCheque: '',                     // Valeurs vides par défaut
      numeroCheque: '',
      banque: '',
      codeAnalytique: '',
      libelleOrdre: '',
      natureOrdre: '',
      dateFacture: '',
      montantCheque: null
    });
  }

  deleteRow(id: number): void {           // Supprime ligne par ID
    if (this.rows.length > 1) {           // Garde au moins 1 ligne
      this.rows = this.rows.filter(row => row.id !== id); // Filtre ligne
      this.saveToLocalStorage();          // Sauvegarde
    }
  }

  navigateToImpression(): void {          // Navigation vers page impression
    this.router.navigate(['/cheque-imprim']); // Change de route
  }

  saveToLocalStorage(): void {            // Sauvegarde dans navigateur
    const validRows = this.rows.filter(row => // Garde seulement lignes remplies
      row.formuleChq || row.dateCheque || row.numeroCheque ||
      row.banque || row.libelleOrdre || row.montantCheque
    );
    localStorage.setItem('cheque_data', JSON.stringify(validRows)); // Stocke en JSON
  }

  loadFromLocalStorage(): void {          // Charge depuis navigateur
    const savedData = localStorage.getItem('cheque_data'); // Récupère données
    if (savedData) {                      // Si données existent
      try {
        const parsedData = JSON.parse(savedData); // Convertit JSON en objet
        if (parsedData && parsedData.length > 0) {
          this.rows = parsedData;         // Remplace lignes
          this.addNewRow();               // Ajoute ligne vide
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
  }

  saveData(): void {                      // Sauvegarde manuelle
    this.saveToLocalStorage();
    alert('Données sauvegardées avec succès !');
  }

  clearAllData(): void {                  // Efface tout
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
      localStorage.removeItem('cheque_data'); // Supprime du navigateur
      this.rows = [];                     // Vide tableau
      this.addNewRow();                   // Recrée ligne vide
    }
  }

  filterRows(): void {                    // Filtre lignes selon recherche
    if (!this.searchTerm.trim()) {        // Si recherche vide
      this.filteredRows = this.rows;      // Affiche tout
      return;
    }

    const search = this.searchTerm.toLowerCase(); // Recherche insensible casse
    this.filteredRows = this.rows.filter(row =>   // Filtre sur tous champs
      row.numeroCheque.toLowerCase().includes(search) ||
      row.banque.toLowerCase().includes(search) ||
      row.libelleOrdre.toLowerCase().includes(search) ||
      row.natureOrdre.toLowerCase().includes(search) ||
      row.dateFacture.includes(search) ||
      (row.montantCheque && row.montantCheque.toString().includes(search))
    );
  }

  get displayedRows(): ChequeRow[] {      // Getter pour lignes affichées
    return this.searchTerm.trim() ? this.filteredRows : this.rows; // Filtrées ou toutes
  }
}
