import {
  useLoaderData,
  useOutletContext,
  useActionData,
} from '@remix-run/react';
import {
  json,
  type LoaderFunctionArgs,
  type DataFunctionArgs,
} from '@remix-run/node';
import { getCollections } from '~/providers/collections/collections';
import { getCustomBanners } from '~/providers/customPlugins/customPlugin';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import type { CurrencyCode } from '~/generated/graphql';
import { SingleBanner } from '~/components/SingleBanner';
import { useTranslation } from 'react-i18next';
import ContentSection from '~/components/ContentSection';
import { ProductCollectionSlider } from '~/components/products/ProductCollectionSlider';
import { search } from '~/providers/products/products';
import useToggleState from '~/utils/use-toggle-state'; 
import { updateCustomer } from '~/providers/account/account'; 
import { withZod } from '@remix-validated-form/with-zod'; 
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import { FormIntent } from '~/routes/account';
import type { FormError } from '~/routes/account';
import { useState, useEffect, useRef } from 'react';
import { Hero } from '~/components/ui/hero';
import { SweetTreatsSection } from '~/components/SweetTreatsSection';
import { PhoneNumberModal } from '~/components/modal/PhoneNumberModal';
import { CollectionCard } from '~/components/collections/CollectionCard';
// Define phone number validator
const phoneNumberValidator = withZod(
  z.object({
    phoneNumber: z
      .string()
      .min(1, { message: 'Phone number is required' })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }),
  }),
);

// Extend loader to fetch active customer details
export async function loader({ request }: LoaderFunctionArgs) {
  const collections = await getCollections(request, { take: 20 });
  const { activeCustomer } = await getActiveCustomerDetails({ request }); // Fetch customer details

  let banners: any[] = [];
  try {
    const bannersResponse = await getCustomBanners(request);
    banners = bannersResponse ? bannersResponse.data : [];
  } catch (error) {
    console.error('Error fetching banners:', error);
  }

  // Fetch products for each collection (unchanged)
  const collectionsWithProducts = await Promise.all(
    collections.map(async (collection) => {
      const searchResults = await search(
        {
          input: {
            take: 12,
            groupByProduct: true,
            term: '',
            collectionId: collection.id,
            inStock: true,
          },
        },
        { request },
      );

      const searchItems = await Promise.all(
        searchResults.search.items.map(async (item) => {
          const { product } = await import(
            '~/providers/products/products'
          ).then((m) => m.getProductBySlug(item.slug, { request }));

          return {
            id: item.productId,
            name: item.productName,
            slug: item.slug,
            featuredAsset: item.productAsset,
            variants: product?.variants?.map((variant) => ({
              id: variant.id,
              name: variant.name,
              priceWithTax: variant.priceWithTax,
              currencyCode: variant.currencyCode as CurrencyCode,
              stockLevel: variant.stockLevel,
              sku: variant.sku,
              featuredAsset: variant.featuredAsset
                ? {
                    preview: variant.featuredAsset.preview,
                  }
                : undefined,
            })) || [
              {
                id: item.productId,
                name: item.productName,
                priceWithTax:
                  typeof item.priceWithTax === 'object'
                    ? 'value' in item.priceWithTax
                      ? item.priceWithTax.value
                      : 'min' in item.priceWithTax
                      ? item.priceWithTax.min
                      : 0
                    : item.priceWithTax || 0,
                currencyCode: item.currencyCode as CurrencyCode,
                stockLevel: 'IN_STOCK',
                sku: item.productId,
                featuredAsset: item.productAsset
                  ? {
                      preview: item.productAsset.preview,
                    }
                  : undefined,
              },
            ],
          };
        }),
      );

      return {
        ...collection,
        products: searchItems,
      };
    }),
  );

  return json({
    collections: collectionsWithProducts,
    banners,
    activeCustomer, // Include activeCustomer in loader data
  });
}

// Action to handle phone number updates
export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();
  const intent = body.get('intent') as FormIntent | null;

  const formError = (formError: FormError, init?: number | ResponseInit) => {
    return json<FormError>(formError, init);
  };

  if (intent === FormIntent.UpdatePhone) {
    const result = await phoneNumberValidator.validate(body);

    if (result.error) {
      return validationError(result.error);
    }

    const { phoneNumber } = result.data;

    try {
      await updateCustomer({ phoneNumber }, { request });
      return json({ customerUpdated: true });
    } catch (error: any) {
      return formError(
        {
          message: error.message || 'Failed to update phone number',
          intent: FormIntent.UpdatePhone,
        },
        { status: 400 },
      );
    }
  }

  return formError({ message: 'No valid form intent' }, { status: 401 });
}

type OutletContext = {
  activeOrderFetcher: any;
  activeOrder: any;
  adjustOrderLine: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  isSignedIn: boolean;
};

export default function Index() {
  const { collections, banners, activeCustomer } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { activeOrderFetcher, activeOrder, isSignedIn } =
    useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const [showPhoneModal, openPhoneModal, closePhoneModal] = useToggleState(
    !activeCustomer?.phoneNumber && isSignedIn,
  ); // Show modal if no phone number and signed in
  const [formError, setFormError] = useState<FormError>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Handle action data
  useEffect(() => {
    if (!actionData) return;

    if ('customerUpdated' in actionData) {
      closePhoneModal();
      setFormError(undefined);
    } else if ('message' in actionData) {
      setFormError(actionData);
    }
  }, [actionData, closePhoneModal]);


  const featuredCollections = [
    {
      slug: 'laddu-sweet-balls',
      backgroundColor: 'bg-white/60',
      backgroundColorInner: 'bg-white/60',
      bannerUrl:
        'https://s3.ap-south-1.amazonaws.com/cdn.kaaikani.co.in/Offer+1000.jpg',
    },
    {
      slug: 'thattai-sev-crispy-snacks',
      backgroundColor: 'bg-green-100',
      bannerUrl:
        'https://assets-jpcust.jwpsrv.com/thumbnails/0pz2lxly-1280.jpg',
    },
    {
      slug: 'podi-powder',
      backgroundColor: 'bg-orange-100',
      bannerUrl:
        'https://assets-jpcust.jwpsrv.com/thumbnails/0pz2lxly-1280.jpg',
    },
    {
      slug: 'achumurukku-murukku-fried-snacks ',
      backgroundColor: 'bg-orange-100',
      bannerUrl:
        'https://assets-jpcust.jwpsrv.com/thumbnails/0pz2lxly-1280.jpg',
    },
    {
      slug: 'adhirasam-special-sweets',
      backgroundColor: 'bg-orange-100',
      bannerUrl:
        'https://assets-jpcust.jwpsrv.com/thumbnails/0pz2lxly-1280.jpg',
    },
  ];

  return (
    <>
    
      {/* Add PhoneNumberModal */}
      {/* <PhoneNumberModal
        open={showPhoneModal}
        onOpenChange={closePhoneModal}
        formError={formError}
        isSubmitting={false} 
        fetcher={undefined}
      /> */}
      {/* <Hero /> */}

      {/* <SweetTreatsSection collections={collections} /> */}

      <section aria-labelledby="category-heading">
        {banners && banners.length >= 1 && (
          <section className="mt-[64px] mb-8 relative">
            <SingleBanner banners={banners} />
          </section>
        )}

        {/* <div className="text-center my-10 px-4 sm:px-6 lg:px-8 z-[-10]">
          <h1 className="text-4xl sm:text-5xl font-semibold uppercase text-gray-800">
            Sweet Treats
          </h1>
          <h2 className="text-base sm:text-lg italic font-normal text-gray-600 mt-1">
            Indulgent Desserts and Candies
          </h2>
        </div>

        <div className="mt-4 z-[-10]">
          <div className="overflow-x-auto whitespace-nowrap pb-4 scrollbar-none snap-x snap-mandatory">
            <div className="inline-flex gap-x-4 sm:gap-x-6 px-4 sm:px-6 lg:px-8">
              {collections.map((collection) => (
                <div
                  className="flex-shrink-0 w-32 sm:w-[180px] md:w-[200px] snap-center"
                  key={collection.id}
                >
                  <CollectionCard collection={collection} />
                </div>
              ))}
            </div>
          </div>
        </div> */}

        <div className="text-center my-10 px-4 sm:px-6 lg:px-8 z-[-10]">
          <h1 className="text-3xl sm:text-5xl font-semibold uppercase text-navy drop-shadow-[0_0_20px_rgba(30,58,95,0.45)]">
            Our Spice Collections
          </h1>
          <h2 className="text-base sm:text-lg italic font-normal text-gray-900 mt-1">
           Explore the rich aroma of nature’s finest blends.
          </h2>
        </div>

        {/* <div className="mt-4 z-[-10]">
          {featuredCollections.map((fc) => (
            <ProductCollectionSlider
              key={fc.slug}
              collectionSlug={fc.slug}
              activeOrderFetcher={activeOrderFetcher}
              activeOrder={activeOrder}
              isSignedIn={isSignedIn}
              backgroundColor={fc.backgroundColor}
              bannerUrl={fc.bannerUrl}
            />
          ))}
        </div> */}

        <div className="mt-4 relative">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollLeft();
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white active:bg-white shadow-lg rounded-full p-2 transition-all duration-200 flex items-center justify-center w-10 h-10 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="Scroll left"
          >
            <svg
              className="w-6 h-6 text-gray-800 pointer-events-none"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto whitespace-nowrap pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="inline-flex gap-x-4 sm:gap-x-6 pl-14 pr-14 sm:pl-16 sm:pr-16">
              {collections.map((collection) => (
                <div
                  className="flex-shrink-0 w-32 sm:w-[180px] md:w-[200px] snap-center"
                  key={collection.id}
                >
                  <CollectionCard collection={collection} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollRight();
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white active:bg-white shadow-lg rounded-full p-2 transition-all duration-200 flex items-center justify-center w-10 h-10 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="Scroll right"
          >
            <svg
              className="w-6 h-6 text-gray-800 pointer-events-none"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div className="mt-4 mb-10 z-[-10]">
          <ContentSection />
        </div>
      </section>
    </>
  );
}
