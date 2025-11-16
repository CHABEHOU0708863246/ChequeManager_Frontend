import { Bank } from "./Bank";
import { BankAccount } from "./BankAccount";
import { Cheque } from "./Cheque";
import { User } from "./User";

export interface ChequeWithDetails extends Cheque {
  bankAccount?: BankAccount;
  bank?: Bank;
  creator?: User;
}
