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
    <div className="card cursor-pointer hover:shadow-lg transition-shadow">
      <Link href={`/listing/${id}`} className="block">
        <div className="w-full h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-neutral-muted">
              No image uploaded
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-neutral-dark line-clamp-2">
            {title}
          </h3>

          {mrp && (
            <div className="text-xs text-neutral-muted line-through">
              ₹{mrp}
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-red">
              ₹{price}
            </span>
            {mrp && mrp > price && (
              <span className="text-[11px] text-green-700">
                {Math.round(((mrp - price) / mrp) * 100)}% off
              </span>
            )}
          </div>

          {negotiable && (
            <div className="text-[11px] text-neutral-muted">
              Negotiable • Chat to lower price
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
