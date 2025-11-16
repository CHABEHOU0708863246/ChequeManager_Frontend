import { LayoutConfig } from "./LayoutConfig";

export interface ChequeTemplate {
  id: string;
  bankId: string;
  templateName: string;
  width: number;
  height: number;
  background: string;
  layoutConfig: LayoutConfig;
  isActive: boolean;
}
