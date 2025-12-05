import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UnreadChatBadge() {
    const { data } = useSWR('/api/chat/unread', fetcher, { refreshInterval: 5000 });

    if (!data || data.count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-kh-purple text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
            {data.count > 9 ? '9+' : data.count}
        </span>
    );
}
