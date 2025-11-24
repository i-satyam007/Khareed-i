import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser() {
    const { data, mutate, error } = useSWR('/api/auth/me', fetcher);

    const loading = !data && !error;
    const loggedOut = error && error.status === 401;

    return {
        loading,
        loggedOut,
        user: data?.user,
        mutate,
    };
}
