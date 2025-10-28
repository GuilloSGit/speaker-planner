import { config } from 'dotenv';
import { resolve } from 'path';
import { saveMasterTalks } from '../src/lib/firebase/talks';

// Cargar variables de entorno desde .env.local
// Esto es solo para scripts, Next.js manejará las variables en tiempo de ejecución
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

const initTalks = async () => {
  try {
    console.log('Iniciando carga de discursos...');
    await saveMasterTalks();
    console.log('Carga de discursos completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar los discursos:', error);
    process.exit(1);
  }
};

initTalks();
