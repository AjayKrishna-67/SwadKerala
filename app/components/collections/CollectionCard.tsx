import { Link } from '@remix-run/react';
import type { CollectionsQuery } from '~/generated/graphql';

export function CollectionCard({
  collection,
}: {
  collection: CollectionsQuery['collections']['items'][number];
}) {
  return (
    <div className="flex-shrink-0 w-full">
      <Link
        to={'/collections/' + collection.slug}
        prefetch="intent"
        key={collection.id}
        className="block relative rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-black/20"
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full">
          <img
            className="w-full h-full object-cover"
            alt={collection.name}
            src={
              collection.featuredAsset?.preview
                ? collection.featuredAsset.preview + '?w=400&h=400'
                : '/placeholder.svg?height=400&width=400'
            }
          />
        </div>
        
        {/* Text below image with white background */}
        <div className="bg-gradient-to-t from-black/60 via-black/30 px-3 py-2.5 min-h-[50px] backdrop-blur-sm flex items-center justify-center">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 text-center line-clamp-2">
            {collection.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}
