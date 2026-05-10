import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
  try {
    // Attempting a simple read to check database existence
    console.log(`Checking Firestore connectivity (Database: ${dbId})...`);
    const healthRef = doc(db, '_health_', 'check');
    // Using getDocFromServer to bypass local cache and force a network request
    await getDocFromServer(healthRef);
    console.log("Firestore connection successful.");
  } catch (error: any) {
    if (error.code === 'not-found' || error.message?.includes('not found')) {
      console.error(`CRITICAL: Firestore Database '${dbId}' not found in project '${(firebaseConfig as any).projectId}'. Please go to https://console.firebase.google.com/project/${(firebaseConfig as any).projectId}/firestore to create your database.`);
    } else if (error.code === 'unavailable') {
      console.error(`CRITICAL: Firestore (${dbId}) is unavailable. This usually means the backend could not be reached. Verify that the project ID is correct and that Firestore is enabled in the Firebase Console.`);
    } else if (error.code === 'permission-denied') {
      console.log(`Firestore connection verified (Permission Denied for ${dbId}). This is normal if you haven't set up rules for the _health_ collection.`);
    } else {
      console.error(`Firestore (${dbId}) connection error:`, error.code, error.message);
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
