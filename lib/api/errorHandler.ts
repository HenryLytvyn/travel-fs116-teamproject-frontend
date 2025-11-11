// Backend response structure
export type BackendResponse<T> = {
  status: number;
  message?: string;
  data: T;
  error?: string;
};

/**
 * Check if an object looks like a User (has id and email)
 */
function isUserLike(obj: unknown): obj is { id: unknown; email: unknown } {
  if (!obj || typeof obj !== 'object') return false;

  if (!('email' in obj) || !obj.email) return false;

  const hasId = ('id' in obj && !!obj.id) || ('_id' in obj && !!obj._id);

  return hasId;
}

/**
 * Extract user from backend response
 */
export function extractUser<T>(
  responseData: BackendResponse<T> | unknown
): T | null {
  if (!responseData || typeof responseData !== 'object') {
    return null;
  }
  if (isUserLike(responseData)) {
    return responseData as T;
  }

  const backendResponse = responseData as BackendResponse<T> &
    Record<string, unknown>;

  if ('data' in backendResponse && backendResponse.data) {
    const data = backendResponse.data;

    if (isUserLike(data)) {
      return data as T;
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      isUserLike((data as { data: unknown }).data)
    ) {
      return (data as { data: T }).data;
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'user' in data &&
      isUserLike((data as { user: unknown }).user)
    ) {
      return (data as { user: T }).user;
    }
  }

  return null;
}
