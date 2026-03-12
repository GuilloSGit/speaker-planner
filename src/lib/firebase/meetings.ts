import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Meeting } from '@/types';

const MEETINGS_COLLECTION = 'meetings';

/**
 * Recursively removes keys with undefined values from an object.
 */
const sanitizeData = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeData(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, sanitizeData(v)])
        );
    }
    return obj;
};

/**
 * Saves or updates a meeting for a specific user.
 * Document ID is userId_dateString
 */
export const saveMeeting = async (userId: string, meeting: Meeting): Promise<void> => {
    try {
        const docId = `${userId}_${meeting.fecha}`;
        const meetingRef = doc(db, MEETINGS_COLLECTION, docId);

        const sanitizedMeeting = sanitizeData(meeting);

        await setDoc(meetingRef, {
            ...sanitizedMeeting,
            userId,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Programa guardado con éxito');
    } catch (error) {
        console.error('Error al guardar el programa:', error);
        throw error;
    }
};

/**
 * Fetches a meeting for a specific user and date.
 */
export const getMeetingByDate = async (userId: string, dateStr: string): Promise<Meeting | null> => {
    try {
        const docId = `${userId}_${dateStr}`;
        const meetingRef = doc(db, MEETINGS_COLLECTION, docId);
        const docSnap = await getDoc(meetingRef);

        if (docSnap.exists()) {
            return docSnap.data() as Meeting;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener el programa:', error);
        throw error;
    }
};

/**
 * Fetches all meeting dates that have been saved by a specific user.
 * This is used for indicators in the calendar.
 */
export const getSavedMeetingDates = async (userId: string): Promise<string[]> => {
    try {
        const q = query(
            collection(db, MEETINGS_COLLECTION),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().fecha);
    } catch (error) {
        console.error('Error al obtener fechas guardadas:', error);
        return [];
    }
};
