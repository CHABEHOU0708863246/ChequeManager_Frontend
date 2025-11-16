import { Address } from "./Address";

export interface BankAccount {
  id: string;
  bankId: string;
  accountHolderName: string;
  codeBank: string;
  codeGuichet: string;
  accountNumber: string;
  ribKey: string;
  fullAccountNumber: string;
  agencyName: string;
  agencyCode?: string;
  agencyLocation: string;
  accountHolderAddress: Address;
  phoneNumbers?: string[];
  referenceInterne?: string;
  isActive: boolean;
}
