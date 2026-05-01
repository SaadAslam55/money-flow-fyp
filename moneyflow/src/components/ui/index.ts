// src/components/ui/index.ts
/**
 * Centralized UI component exports
 * Import all UI components from here for better organization
 * 
 * Usage:
 * import { Button, Input, Card } from '@/components/ui';
 */

// Form Components
export { Input, type InputProps } from './input';
export { Label } from './label';
export { Textarea, type TextareaProps } from './textarea';
export { Checkbox, type CheckboxProps } from './checkbox';
export { RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioGroupItemProps } from './radio-group';
export { Switch, type SwitchProps } from './switch';
export {
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

// Layout Components
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
export { Separator } from './separator';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

// Feedback Components
export {
  Alert,
  AlertDescription,
  AlertTitle,
  type AlertProps,
} from './alert';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export { Skeleton, type SkeletonProps } from './skeleton';
export { Progress, type ProgressProps } from './progress';
export {
  Toaster,
  toast,
  useToast,
} from './toast';

// Overlay Components
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from './sheet';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

// Data Display Components
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
export { Calendar, type CalendarProps } from './calendar';

// Action Components
export { Button, buttonVariants, type ButtonProps } from './button';

