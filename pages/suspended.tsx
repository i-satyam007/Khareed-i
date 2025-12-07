import React from 'react';
import Head from 'next/head';
import { useUser } from '@/lib/hooks/useUser';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SuspendedPage() {
    const { user, logout } = useUser();
    const router = useRouter();

    // If somehow a non-logged in user or non-banned user accesses this, redirect home
    // But we need to be careful not to create loops.
    // Generally, we can leave it accessible, but mostly it's for banned users.

    React.useEffect(() => {
        if (user && !user.blacklistUntil) {
            // If user is NOT banned, they shouldn't be here
            router.push('/');
        }
    }, [user, router]);


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Head>
                <title>Account Suspended | Khareed-i</title>
            </Head>

            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>

                <p className="text-gray-600 mb-6">
                    Your account has been suspended for violation of our Terms and Conditions.
                    You can no longer access the marketplace or your orders.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-500">
                    <p className="mb-1">Need help or believe this is a mistake?</p>
                    <a href="mailto:support@khareed-i.shop" className="text-kh-purple font-bold hover:underline">
                        support@khareed-i.shop
                    </a>
                </div>

                <button
                    onClick={() => {
                        logout();
                        router.push('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            <p className="mt-8 text-xs text-center text-gray-400">
                &copy; {new Date().getFullYear()} Khareed-i. All rights reserved.
            </p>
        </div>
    );
}
