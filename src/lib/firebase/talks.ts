import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { MASTER_TALKS } from '../constants';

export interface Talk {
  id: number;
  title: string;
}

const TALKS_COLLECTION = 'talks';

export const saveMasterTalks = async (): Promise<void> => {
  try {
    const batch: Promise<void>[] = [];
    MASTER_TALKS.forEach((talk) => {
      const talkRef = doc(db, TALKS_COLLECTION, talk.id.toString());
      batch.push(setDoc(talkRef, talk));
    });
    await Promise.all(batch);
    console.log('Todas los discursos se han guardado correctamente');
  } catch (error) {
    console.error('Error al guardar los discursos:', error);
    throw error;
  }
};

export const getAllTalks = async (): Promise<Talk[]> => {
  try {
    const q = query(collection(db, TALKS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.data().id,
      title: doc.data().title
    } as Talk));
  } catch (error) {
    console.error('Error al obtener los discursos:', error);
    throw error;
  }
};

export const getTalkById = async (id: number): Promise<Talk | null> => {
  try {
    const q = query(
      collection(db, TALKS_COLLECTION),
      where('id', '==', id)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return {
      id: doc.data().id,
      title: doc.data().title
    } as Talk;
  } catch (error) {
    console.error('Error al obtener el discurso:', error);
    throw error;
  }
};
