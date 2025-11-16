export interface Cheque {
  id: string;
  chequeNumber: string;
  serieNumber?: string;
  bankAccountId: string;
  beneficiaryName: string;
  amountInNumbers: number;
  amountInLetters: string;
  issueDate?: string;
  issuePlace: string;
  payableAt: string;
  cmc7Code: string;
  isEndorsable: boolean;
  status: ChequeStatus;
  createdBy: string;
  createdAt: string;
  printedAt?: string;
  voidedAt?: string;
  voidReason?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export enum ChequeStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  PRINTED = 'PRINTED',
  VOIDED = 'VOIDED'
}
