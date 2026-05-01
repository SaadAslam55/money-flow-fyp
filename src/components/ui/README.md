# UI Components (shadcn/ui)

Production-ready UI component library built with Radix UI primitives and Tailwind CSS.

## Overview

All components follow shadcn/ui patterns and are fully typed with TypeScript. They include:
- ✅ Full TypeScript support
- ✅ Accessibility (ARIA) attributes
- ✅ Error states
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Consistent styling

## Components

### Form Components

#### Input
```tsx
import { Input } from '@/components/ui';

<Input 
  type="text" 
  placeholder="Enter text"
  error={hasError}
/>
```

#### Textarea
```tsx
import { Textarea } from '@/components/ui';

<Textarea 
  placeholder="Enter description"
  error={hasError}
/>
```

#### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox
```tsx
import { Checkbox } from '@/components/ui';

<Checkbox 
  checked={isChecked}
  onCheckedChange={setIsChecked}
  error={hasError}
/>
```

#### Radio Group
```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui';
import { Label } from '@/components/ui';

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
</RadioGroup>
```

#### Switch
```tsx
import { Switch } from '@/components/ui';

<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
  error={hasError}
/>
```

### Layout Components

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

#### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Feedback Components

#### Alert
```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Skeleton
```tsx
import { Skeleton } from '@/components/ui';

<Skeleton className="h-4 w-full" />
<Skeleton variant="circular" className="h-12 w-12" />
```

#### Progress
```tsx
import { Progress } from '@/components/ui';

<Progress value={75} variant="success" showValue />
```

#### Toast
```tsx
import { toast } from '@/components/ui';
import { Toaster } from '@/components/ui';

// In your app root
<Toaster />

// Usage
toast.success('Operation successful');
toast.error('Operation failed');
toast.warning('Warning message');
toast.info('Information message');
```

### Overlay Components

#### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui';

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    Content here
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Alert Dialog
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui';

<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Sheet
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui';

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    Content here
  </SheetContent>
</Sheet>
```

#### Popover
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content here</PopoverContent>
</Popover>
```

#### Dropdown Menu
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Data Display Components

#### Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Pagination
```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

#### Avatar
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';

<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Tooltip
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip content</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Calendar
```tsx
import { Calendar } from '@/components/ui';

<Calendar 
  value={date}
  onSelect={setDate}
  mode="single"
/>
```

### Action Components

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" size="lg">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Features

### Error States
Most form components support an `error` prop for validation feedback:
```tsx
<Input error={!!errors.email} />
<Textarea error={!!errors.description} />
<Checkbox error={!!errors.terms} />
```

### Accessibility
All components include:
- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

### Theming
Components automatically adapt to light/dark themes based on the UI store theme setting.

### TypeScript
All components are fully typed with exported interfaces for props.

## Best Practices

1. **Always use the index file for imports**:
   ```tsx
   import { Button, Input, Card } from '@/components/ui';
   ```

2. **Handle errors properly**:
   ```tsx
   <Input error={!!errors.field} />
   ```

3. **Use proper semantic HTML**:
   ```tsx
   <Label htmlFor="email">Email</Label>
   <Input id="email" />
   ```

4. **Provide accessible labels**:
   ```tsx
   <Button aria-label="Close dialog">×</Button>
   ```

## Dependencies

- `@radix-ui/*` - UI primitives
- `class-variance-authority` - Variant management
- `clsx` & `tailwind-merge` - Class utilities
- `lucide-react` - Icons
- `sonner` - Toast notifications

## Notes

- Calendar component uses native date input. For advanced features, install `react-day-picker`
- Toast component integrates with the UI store for theme support
- All components support className prop for custom styling

