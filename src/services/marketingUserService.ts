import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface MarketingUser {
  username: string;
  passwordHash: string;
  isLocked: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Secure native SHA-256 hashing using Web Crypto API (fully Client-Side safe)
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const marketingUserService = {
  /**
   * Automatically seeds the default user (Vishal / 1234) if it does not yet exist.
   */
  seedDefaultUser: async () => {
    const defaultUsername = 'Vishal';
    const docRef = doc(db, 'marketing_users', defaultUsername);
    let docSnap;
    try {
      docSnap = await getDoc(docRef);
    } catch (error) {
      console.error('[MarketingUser] Error checking default user:', error);
      handleFirestoreError(error, OperationType.GET, `marketing_users/${defaultUsername}`);
      return;
    }
    
    if (docSnap && !docSnap.exists()) {
      try {
        const defaultHash = await hashPassword('1234');
        await setDoc(docRef, {
          username: defaultUsername,
          passwordHash: defaultHash,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log('[MarketingUser] Default user "Vishal" successfully seeded.');
      } catch (error) {
        console.error('[MarketingUser] Error seeding default user:', error);
        handleFirestoreError(error, OperationType.WRITE, `marketing_users/${defaultUsername}`);
      }
    }
  },

  /**
   * Logs in a custom marketing user
   */
  login: async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: MarketingUser }> => {
    try {
      if (!username || !password) {
        return { success: false, error: 'User ID and Password are required.' };
      }
      
      const docRef = doc(db, 'marketing_users', username);
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `marketing_users/${username}`);
        throw error;
      }

      if (!docSnap.exists()) {
        return { success: false, error: 'Invalid User ID or Password' };
      }

      const userData = docSnap.data() as MarketingUser;

      if (userData.isLocked) {
        return { success: false, error: 'Account Locked' };
      }

      const inputHash = await hashPassword(password);
      if (inputHash === userData.passwordHash) {
        return { success: true, user: userData };
      }

      return { success: false, error: 'Invalid User ID or Password' };
    } catch (error) {
      console.error('[MarketingUser] Error during custom login:', error);
      if (error instanceof Error && error.message.includes('{"error"')) {
        throw error;
      }
      return { success: false, error: 'Authentication failed. Please try again later.' };
    }
  },

  /**
   * Fetches all custom marketing users for admin management
   */
  getUsers: async (): Promise<MarketingUser[]> => {
    try {
      const q = query(collection(db, 'marketing_users'), orderBy('username', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as MarketingUser);
    } catch (error) {
      console.error('[MarketingUser] Error fetching custom users:', error);
      handleFirestoreError(error, OperationType.LIST, 'marketing_users');
      throw error;
    }
  },

  /**
   * Creates a new custom marketing user account
   */
  createUser: async (username: string, passwordPlain: string): Promise<void> => {
    const docRef = doc(db, 'marketing_users', username);
    let docSnap;
    try {
      docSnap = await getDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `marketing_users/${username}`);
      throw error;
    }

    if (docSnap.exists()) {
      throw new Error(`User ID "${username}" already exists.`);
    }

    const passwordHash = await hashPassword(passwordPlain);
    try {
      await setDoc(docRef, {
        username,
        passwordHash,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[MarketingUser] Error creating user:', error);
      handleFirestoreError(error, OperationType.WRITE, `marketing_users/${username}`);
      throw error;
    }
  },

  /**
   * Updates an existing custom marketing user (e.g. password or lock status)
   */
  updateUser: async (username: string, updates: { passwordPlain?: string; isLocked?: boolean }): Promise<void> => {
    try {
      const docRef = doc(db, 'marketing_users', username);
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (updates.passwordPlain !== undefined && updates.passwordPlain !== '') {
        updateData.passwordHash = await hashPassword(updates.passwordPlain);
      }

      if (updates.isLocked !== undefined) {
        updateData.isLocked = updates.isLocked;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('[MarketingUser] Error updating user:', error);
      handleFirestoreError(error, OperationType.UPDATE, `marketing_users/${username}`);
      throw error;
    }
  },

  /**
   * Deletes a custom marketing user account
   */
  deleteUser: async (username: string): Promise<void> => {
    try {
      if (username === 'Vishal') {
        throw new Error('Default system user "Vishal" cannot be deleted.');
      }
      const docRef = doc(db, 'marketing_users', username);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[MarketingUser] Error deleting user:', error);
      handleFirestoreError(error, OperationType.DELETE, `marketing_users/${username}`);
      throw error;
    }
  }
};
