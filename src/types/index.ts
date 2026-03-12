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

export interface MeetingMember {
  id?: string;
  nombre: string;
  apellido: string;
}

export interface IncomingSpeaker {
  id?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  congregacion: string;
  nroDiscurso: number;
  cancion?: string;
  imagenes?: string[];
  videos?: string[];
}

export interface OutgoingSpeaker {
  id?: string;
  speakerId: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: string;
  nroDiscurso: number;
  congregacionDestino: string;
  horarioReunion: string;
  direccionReunion?: string;
  lat?: number;
  lng?: number;
}

export type SpecialEventType =
  | 'Visita del Superintendente'
  | 'Visita de enviado de la Central Mundial'
  | 'Asamblea de Circuito'
  | 'Asamblea Regional'
  | 'Conferencia Especial'
  | 'Conmemoración'
  | 'Otra fecha especial';


export interface Meeting {
  id?: string;
  fecha: string; // The exact Date string for this particular weekend (e.g. 2024-03-16T00:00:00.000Z)
  time?: string; // Allows a specific meeting to be hosted at a different time from the default (e.g. '18:00')
  type?: 'regular' | 'special';
  specialEvent?: SpecialEventType;
  incomingSpeaker?: IncomingSpeaker;
  outgoingSpeakers?: OutgoingSpeaker[];
  presidente?: MeetingMember;
  conductorAtalaya?: MeetingMember;
  microfonos?: MeetingMember[];
  audioyvideo?: MeetingMember[];
  acomodadores?: MeetingMember[];
}

export interface Arrangement {
  id?: string;
  mes: string;
  congregacionConLaQueSeArregla: string;
}
