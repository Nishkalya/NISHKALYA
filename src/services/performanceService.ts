import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from './testimonialService';

export interface PerformanceLog {
  id: string;
  page: string;
  loadTimeMs: number;
  userAgent: string;
  type: 'pageload' | 'transition';
  createdAt: any;
}

const PERFORMANCE_LOGS_COLLECTION = 'performance_logs';

export const performanceService = {
  subscribeToLogs: (callback: (logs: PerformanceLog[]) => void, maxCount = 100) => {
    const q = query(
      collection(db, PERFORMANCE_LOGS_COLLECTION), 
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PerformanceLog[];
      callback(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PERFORMANCE_LOGS_COLLECTION);
    });
  },

  logPerformance: async (log: Omit<PerformanceLog, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, PERFORMANCE_LOGS_COLLECTION), {
        ...log,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PERFORMANCE_LOGS_COLLECTION);
      throw error;
    }
  },

  deleteLog: async (id: string) => {
    try {
      await deleteDoc(doc(db, PERFORMANCE_LOGS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PERFORMANCE_LOGS_COLLECTION}/${id}`);
      throw error;
    }
  },

  clearAllLogs: async () => {
    try {
      const snapshot = await getDocs(collection(db, PERFORMANCE_LOGS_COLLECTION));
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(doc(db, PERFORMANCE_LOGS_COLLECTION, document.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, PERFORMANCE_LOGS_COLLECTION);
      throw error;
    }
  }
};
