import { 
  collection, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('order', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Project[];
      callback(onlyActive ? projects.filter(p => p.isActive !== false) : projects);
    }, (error) => {
      console.error("Error subscribing to projects:", error);
    });
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

