export interface Talk {
  id: number;
  available?: boolean;
}

export interface Speaker {
  id: string;
  first_name: string;
  family_name: string;
  role: string;
  available: boolean;
  talks: Talk[];
}
