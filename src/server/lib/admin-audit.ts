import { query } from '@/lib/db';
export async function audit(adminUserId:string, action:string, entityType:string, entityId?:string, details?:unknown){
  await query('INSERT INTO admin_audit_log(admin_user_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[adminUserId,action,entityType,entityId??null,details??null]);
}
