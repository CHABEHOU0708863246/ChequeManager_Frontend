import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Bank } from '../../models/Bank';
import { BankAccount } from '../../models/BankAccount';
import { ChequeImageGeneratorService } from '../../services/Checkimg/cheque-image-generator.service';
import { NumberToWordsUtil } from '../../utils/umber-to-words.util';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cheque-form',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cheque-form.component.html',
  styleUrl: './cheque-form.component.scss'
})
export class ChequeFormComponent implements OnInit {
  chequeForm!: FormGroup;
  banks: Bank[] = [];
  bankAccounts: BankAccount[] = [];
  filteredAccounts: BankAccount[] = [];

  amountInLetters: string = '';
  chequePreviewUrl: string = '';
  isGenerating: boolean = false;
  showPreview: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  private apiUrl = 'http://localhost:3001';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private chequeGenerator: ChequeImageGeneratorService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBanks();
    this.loadBankAccounts();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.chequeForm = this.fb.group({
      bankId: ['', Validators.required],
      bankAccountId: ['', Validators.required],
      beneficiaryName: ['', [Validators.required, Validators.minLength(3)]],
      amountInNumbers: [0, [Validators.required, Validators.min(1)]],
      issuePlace: ['ABIDJAN', Validators.required],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });
  }

  private setupFormListeners(): void {
    // Filtrer les comptes selon la banque sélectionnée
    this.chequeForm.get('bankId')?.valueChanges.subscribe(bankId => {
      this.filteredAccounts = this.bankAccounts.filter(acc => acc.bankId === bankId);
      this.chequeForm.patchValue({ bankAccountId: '' });
    });

    // Convertir le montant en lettres automatiquement
    this.chequeForm.get('amountInNumbers')?.valueChanges.subscribe(amount => {
      if (amount && amount > 0) {
        this.amountInLetters = NumberToWordsUtil.convertToWords(amount);
      } else {
        this.amountInLetters = '';
      }
    });
  }

  private loadBanks(): void {
    this.http.get<Bank[]>(`${this.apiUrl}/banks`).subscribe({
      next: (data) => {
        this.banks = data;
      },
      error: (error) => {
        console.error('Erreur chargement banques:', error);
        this.errorMessage = 'Impossible de charger les banques';
      }
    });
  }

  private loadBankAccounts(): void {
    this.http.get<BankAccount[]>(`${this.apiUrl}/bankAccounts`).subscribe({
      next: (data) => {
        this.bankAccounts = data;
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
        this.errorMessage = 'Impossible de charger les comptes';
      }
    });
  }

  async onPreviewCheque(): Promise<void> {
    if (this.chequeForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isGenerating = true;
    this.errorMessage = '';

    try {
      const formValue = this.chequeForm.value;
      const selectedBank = this.banks.find(b => b.id === formValue.bankId);
      const selectedAccount = this.filteredAccounts.find(a => a.id === formValue.bankAccountId);

      if (!selectedBank || !selectedAccount) {
        throw new Error('Banque ou compte non trouvé');
      }

      const chequeData = {
        bankCode: selectedBank.code,
        chequeNumber: this.generateChequeNumber(),
        beneficiaryName: formValue.beneficiaryName,
        amountInNumbers: formValue.amountInNumbers,
        amountInLetters: this.amountInLetters,
        issueDate: formValue.issueDate,
        issuePlace: formValue.issuePlace,
        accountHolderName: selectedAccount.accountHolderName,
        accountNumber: selectedAccount.fullAccountNumber,
        agencyName: selectedAccount.agencyName,
        agencyLocation: selectedAccount.agencyLocation,
        cmc7Code: this.generateCMC7Code(selectedAccount),
        bankName: selectedBank.fullName,
        bankGroup: selectedBank.group
      };

      this.chequePreviewUrl = await this.chequeGenerator.generateChequeImage(chequeData);
      this.showPreview = true;
    } catch (error) {
      console.error('Erreur génération:', error);
      this.errorMessage = 'Erreur lors de la génération du chèque';
    } finally {
      this.isGenerating = false;
    }
  }

  async onSaveCheque(): Promise<void> {
    if (this.chequeForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.chequeForm.value;
      const selectedAccount = this.filteredAccounts.find(a => a.id === formValue.bankAccountId);

      const newCheque = {
        id: Date.now().toString(),
        chequeNumber: this.generateChequeNumber(),
        serieNumber: null,
        bankAccountId: formValue.bankAccountId,
        beneficiaryName: formValue.beneficiaryName,
        amountInNumbers: formValue.amountInNumbers,
        amountInLetters: this.amountInLetters,
        issueDate: formValue.issueDate,
        issuePlace: formValue.issuePlace,
        payableAt: selectedAccount?.agencyName || '',
        cmc7Code: this.generateCMC7Code(selectedAccount!),
        isEndorsable: false,
        status: 'GENERATED',
        createdBy: '1',
        createdAt: new Date().toISOString(),
        printedAt: null,
        voidedAt: null,
        voidReason: null,
        notes: formValue.notes,
        metadata: {
          ipAddress: '127.0.0.1',
          deviceInfo: navigator.userAgent
        }
      };

      this.http.post(`${this.apiUrl}/cheques`, newCheque).subscribe({
        next: (response) => {
          this.successMessage = 'Chèque créé avec succès !';
          this.resetForm();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Erreur sauvegarde:', error);
          this.errorMessage = 'Erreur lors de la sauvegarde du chèque';
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.errorMessage = 'Une erreur est survenue';
      this.isGenerating = false;
    }
  }

  onDownloadCheque(): void {
    if (!this.chequePreviewUrl) return;

    const link = document.createElement('a');
    link.href = this.chequePreviewUrl;
    link.download = `cheque_${Date.now()}.png`;
    link.click();
  }

  resetForm(): void {
    this.chequeForm.reset({
      issuePlace: 'ABIDJAN',
      issueDate: new Date().toISOString().split('T')[0]
    });
    this.amountInLetters = '';
    this.chequePreviewUrl = '';
    this.showPreview = false;
  }

  private generateChequeNumber(): string {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  private generateCMC7Code(account: BankAccount): string {
    const chequeNum = this.generateChequeNumber();
    return `H${chequeNum}H ${account.codeBank}${account.codeGuichet} ${account.accountNumber}${account.ribKey}`;
  }

  // Getters pour le template
  get f() { return this.chequeForm.controls; }

  get isFormValid(): boolean {
    return this.chequeForm.valid;
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }
}
