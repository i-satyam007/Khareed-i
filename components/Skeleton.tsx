import React from 'react';

type SkeletonProps = {
    className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
    );
}

// Pre-configured shapes
export function SkeletonCircle({ className = "" }: SkeletonProps) {
    return <Skeleton className={`rounded-full ${className}`} />;
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className="space-y-2">
            {[...Array(lines)].map((_, i) => (
                <Skeleton key={i} className={`h-4 w-full ${className}`} />
            ))}
        </div>
    );
}
