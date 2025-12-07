import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser() {
    const { data, mutate, error } = useSWR('/api/auth/me', fetcher);

    const loading = !data && !error;
    const loggedOut = error && error.status === 401;

    // Ban Enforcement
    if (data?.user?.blacklistUntil) {
        const blacklistDate = new Date(data.user.blacklistUntil);
        if (blacklistDate > new Date()) {
            if (typeof window !== 'undefined' && window.location.pathname !== '/suspended') {
                window.location.href = '/suspended';
            }
        }
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        mutate(null, false); // Clear data locally
    };

    return {
        loading,
        loggedOut,
        user: data?.user,
        mutate,
        logout
    };
}
