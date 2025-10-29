export interface Talk {
  id: number;
  available?: boolean;
}

export interface Speaker {
  id: string;
  first_name: string;
  family_name: string;
  phone?: string;
  role: string;
  available: boolean;
  talks: Talk[];
  created_at?: string;
  updated_at?: string;
}
