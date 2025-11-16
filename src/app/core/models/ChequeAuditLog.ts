export interface ChequeAuditLog {
  id: string;
  chequeId: string;
  action: 'CREATED' | 'UPDATED' | 'PRINTED' | 'VOIDED';
  userId: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}
