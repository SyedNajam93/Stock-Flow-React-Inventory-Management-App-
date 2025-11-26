import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "692744f84e48ac3c44423dc1", 
  requiresAuth: true // Ensure authentication is required for all operations
});
