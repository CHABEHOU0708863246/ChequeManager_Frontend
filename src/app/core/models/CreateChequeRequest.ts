export interface CreateChequeRequest {
  bankAccountId: string;
  beneficiaryName: string;
  amountInNumbers: number;
  issuePlace: string;
  notes?: string;
}
