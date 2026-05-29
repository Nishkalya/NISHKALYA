import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  rating?: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const TESTIMONIALS_COLLECTION = 'testimonials';

export const DEFAULT_TESTIMONIALS: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    quote: "Nishkalya Studio delivered our core NLP intelligence platform weeks ahead of schedule. The absolute precision in system architecture and beautiful design elements transformed our entire workflow.",
    author: "Elena Rostova",
    title: "VP of Product",
    company: "IntellectSaaS",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    isActive: true
  },
  {
    quote: "The visual fidelity and technical depth of their code is outstanding. We migrated our entire data intelligence dashboard into their design system, and the response from users has been stellar.",
    author: "Marcus Sterling",
    title: "Founder & CTO",
    company: "ApexAI",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    isActive: true
  },
  {
    quote: "Architecting a multi-agent LLM network is incredibly complex. Nishkalya solved it with elegant prompt routing and highly optimized caching. Best collaboration of the year.",
    author: "Dr. Aria Thorne",
    title: "Chief of Deep Search",
    company: "SynthLabs",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    isActive: true
  }
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const testimonialService = {
  subscribeToTestimonials: (callback: (testimonials: Testimonial[]) => void) => {
    const q = query(collection(db, TESTIMONIALS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      callback(testimonials);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, TESTIMONIALS_COLLECTION);
    });
  },

  seedDefaultTestimonials: async () => {
    try {
      const snapshot = await getDocs(collection(db, TESTIMONIALS_COLLECTION)).catch(err => {
        handleFirestoreError(err, OperationType.GET, TESTIMONIALS_COLLECTION);
        throw err;
      });
      if (snapshot.empty) {
        console.log("[Testimonials] Database empty, seeding default entries...");
        for (const [idx, item] of DEFAULT_TESTIMONIALS.entries()) {
          await addDoc(collection(db, TESTIMONIALS_COLLECTION), {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, TESTIMONIALS_COLLECTION + '/seed_' + idx);
            throw err;
          });
        }
      }
    } catch (error) {
      console.error("Error seeding default testimonials:", error);
    }
  },

  addTestimonial: async (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, TESTIMONIALS_COLLECTION), {
        ...testimonial,
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, TESTIMONIALS_COLLECTION);
      throw error;
    }
  },

  updateTestimonial: async (id: string, testimonial: Partial<Testimonial>) => {
    try {
      const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
      await updateDoc(docRef, {
        ...testimonial,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${TESTIMONIALS_COLLECTION}/${id}`);
      throw error;
    }
  },

  deleteTestimonial: async (id: string) => {
    try {
      await deleteDoc(doc(db, TESTIMONIALS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${TESTIMONIALS_COLLECTION}/${id}`);
      throw error;
    }
  }
};
