// components/ProductCard.tsx
import Link from "next/link";

type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  mrp?: number;
  image?: string | null;
  negotiable?: boolean;
};

export default function ProductCard({
  id,
  title,
  price,
  mrp,
  image,
  negotiable,
}: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer">
      <Link href={`/listing/${id}`} className="block h-full flex flex-col">
        {/* Image Area */}
        <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-center p-4">
               <span className="text-2xl mb-2 block">📦</span>
               <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">No Image</span>
            </div>
          )}
          {/* Badges */}
          {negotiable && (
            <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-kh-dark shadow-sm">
              Negotiable
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-medium text-sm text-kh-dark line-clamp-2 mb-2 min-h-[2.5em]">
            {title}
          </h3>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-kh-red">₹{price}</span>
              {mrp && mrp > price && (
                <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
              )}
            </div>
            
            {mrp && mrp > price && (
               <div className="mt-1 text-[10px] font-medium text-green-600 bg-green-50 inline-block px-1.5 py-0.5 rounded">
                 {Math.round(((mrp - price) / mrp) * 100)}% OFF
               </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}