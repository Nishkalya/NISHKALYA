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
  getDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Project {
  id: string;
  title: string;
  category: string;
  desc: string;
  iconType: 'message' | 'eye' | 'layout' | 'chart';
  link?: string;
  screenshots?: string[];
  videoUrl?: string;
  isActive?: boolean;
  order?: number;
  fullDetails?: {
    overview?: string;
    features: string[];
    techStack: { name: string, role?: string }[];
    structure?: { name: string, desc: string }[];
    license: string;
    status?: string;
    acknowledgements?: string;
    howItWorks?: string[];
    runLocally?: string[];
    improvements?: string[];
  };
  createdAt?: any;
  updatedAt?: any;
}

const PROJECTS_COLLECTION = 'projects';
const ADMINS_COLLECTION = 'admins';

export const projectService = {
  subscribeToProjects: (callback: (projects: Project[]) => void, onlyActive = true) => {
    const q = onlyActive 
      ? query(collection(db, PROJECTS_COLLECTION), where('isActive', '==', true), orderBy('createdAt', 'desc'))
      : query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      callback(projects);
    }, (error) => {
      console.error("Error subscribing to projects:", error);
    });
  },

  addProject: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...project,
        isActive: project.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  },

  updateProject: async (id: string, project: Partial<Project>) => {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...project,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  checkIsAdmin: async (uid: string) => {
    try {
      const docRef = doc(db, ADMINS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }
};
