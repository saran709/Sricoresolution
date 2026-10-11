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
  }
}

export function getFriendlyErrorMessage(errMessage: string): string {
  const lower = errMessage.toLowerCase();
  if (lower.includes('permission-denied') || lower.includes('insufficient permissions')) {
    return 'Permission denied. You do not have authorization to perform this action.';
  }
  if (lower.includes('not-found')) {
    return 'The requested record was not found in the database.';
  }
  if (lower.includes('unavailable') || lower.includes('network')) {
    return 'Database connection is temporarily unavailable. Please verify your internet connection.';
  }
  if (lower.includes('already-exists')) {
    return 'A record with this identifier already exists.';
  }
  return errMessage || 'An unexpected database error occurred. Please try again.';
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any = null): never {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const friendly = getFriendlyErrorMessage(rawMsg);

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  // Structured diagnostic logging for debugging
  console.error('[Firestore Error]', {
    operation: operationType,
    path,
    rawError: rawMsg,
    userMessage: friendly
  });

  const customError = new Error(friendly);
  (customError as any).details = errInfo;
  throw customError;
}
