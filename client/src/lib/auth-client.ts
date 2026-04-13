import { createAuthClient } from "better-auth/react"

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASEURL || 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL,
    fetchOptions: {credentials: 'include'},
})

export const { signIn, signUp, useSession } = authClient;