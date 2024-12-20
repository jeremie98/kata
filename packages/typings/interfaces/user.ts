export interface UserReturn {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  created_at: Date;
  deleted_at?: Date | null;
}
