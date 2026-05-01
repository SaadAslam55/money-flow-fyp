/**
 * Button Component Tests
 *
 * Unit tests for the Button component from shadcn/ui
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Test Click</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: 'Test Click' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button', { name: 'Disabled Button' })).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    
    render(
      <Button disabled onClick={handleClick}>
        No Click
      </Button>
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'No Click' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes correctly', () => {
    const { unmount } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-destructive');
    unmount();
    
    render(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('border-input');
  });

  it('applies size classes correctly', () => {
    const { unmount } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('h-9');
    unmount();
    
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button', { name: 'Large' })).toHaveClass('h-11');
  });

  it('renders as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: 'Link Button' })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button disabled>Loading...</Button>);
    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeDisabled();
  });
});

