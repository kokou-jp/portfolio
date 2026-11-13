import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const ToastProvider = ToastPrimitive.Provider;

type ToastViewportElement = React.ComponentRef<typeof ToastPrimitive.Viewport>;
type ToastElement = React.ComponentRef<typeof ToastPrimitive.Root>;
type ToastActionElement = React.ComponentRef<typeof ToastPrimitive.Action>;
type ToastCloseElement = React.ComponentRef<typeof ToastPrimitive.Close>;
type ToastTitleElement = React.ComponentRef<typeof ToastPrimitive.Title>;
type ToastDescriptionElement = React.ComponentRef<typeof ToastPrimitive.Description>;

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: 'default' | 'destructive';
}

const ToastViewport = React.forwardRef<
  ToastViewportElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-w-sm flex-col-reverse p-4 md:max-w-sm md:right-0 md:left-auto',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const Toast = React.forwardRef<ToastElement, ToastProps>(({ className, variant = 'default', ...props }, ref) => {
  const baseClass = 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg';

  const variantClass = variant === 'destructive'
    ? 'destructive group bg-destructive text-destructive-foreground'
    : 'group bg-background text-foreground border';

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(baseClass, variantClass, 'data-[state=closed]:animate-out data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full', className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  ToastActionElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex shrink-0 justify-center rounded-md border bg-secondary px-4 py-2 text-xs font-medium shadow hover:bg-secondary/90',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  ToastCloseElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:animate-in group-hover:opacity-100',
      className,
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  ToastTitleElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  ToastDescriptionElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
};
