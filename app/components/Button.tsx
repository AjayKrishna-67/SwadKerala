import clsx from 'clsx';
import { trackButtonClick } from '~/utils/meta-pixel';

export function Button(
  props: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track button click for Meta Pixel
    const buttonName =
      typeof props.children === 'string'
        ? props.children
        : props['aria-label'] || 'Button';
    trackButtonClick(buttonName, 'Button');

    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={clsx(
        'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gold',
        'border rounded-md py-2 px-4 text-base font-medium text-white',
        'bg-spice hover:bg-spice-600',
        'flex items-center justify-around gap-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.className,
      )}
      style={{
        ...props.style,
      }}
    >
      {props.children}
    </button>
  );
}