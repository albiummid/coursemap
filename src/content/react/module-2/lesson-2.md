---
title: "Building Custom Hooks"
duration: "20 min"
order: 2
tags: ["hooks", "custom-hooks", "reusability", "advanced"]
description: "Learn to build powerful, reusable custom Hooks — the ultimate pattern for sharing stateful logic between components."
---

## What Are Custom Hooks?

A **custom Hook** is a JavaScript function whose name starts with `use` and that may call other Hooks. Custom Hooks let you extract component logic into reusable functions.

> **The Convention:** The `use` prefix is not just a naming convention — it tells React's linting tools to check for Rules of Hooks violations inside the function.

## Your First Custom Hook

Let's build a `useToggle` hook:

```tsx
import { useState, useCallback } from 'react';

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback((): void => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback((): void => setValue(true), []);
  const setFalse = useCallback((): void => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

export default useToggle;
```

### Usage

```tsx
function ModalExample() {
  const { value: isOpen, toggle, setFalse: close } = useToggle();

  return (
    <div>
      <button onClick={toggle}>Toggle Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal Content</p>
          <button onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
```

## Code Walkthrough: useLocalStorage

Let's build a production-quality `useLocalStorage` hook step by step.

### Step 1: Define the Interface

```tsx
type SetValue<T> = T | ((prevValue: T) => T);

interface UseLocalStorageReturn<T> {
  storedValue: T;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
}
```

### Step 2: Implement the Hook

```tsx
import { useState, useCallback, useEffect } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // Lazy initialization — read from localStorage only once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch (error: unknown) {
      console.warn(
        `Error reading localStorage key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // Persist to localStorage whenever the value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error: unknown) {
      console.warn(
        `Error writing localStorage key "${key}":`,
        error
      );
    }
  }, [key, storedValue]);

  // Setter that supports both direct values and updater functions
  const setValue = useCallback(
    (value: SetValue<T>): void => {
      setStoredValue(prev => {
        const nextValue =
          value instanceof Function ? value(prev) : value;
        return nextValue;
      });
    },
    []
  );

  // Remove from localStorage
  const removeValue = useCallback((): void => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error: unknown) {
      console.warn(
        `Error removing localStorage key "${key}":`,
        error
      );
    }
  }, [key, initialValue]);

  return { storedValue, setValue, removeValue };
}
```

### Step 3: Use It

```tsx
function SettingsPage() {
  const { storedValue: theme, setValue: setTheme } =
    useLocalStorage<'light' | 'dark'>('theme', 'dark');

  const { storedValue: fontSize, setValue: setFontSize } =
    useLocalStorage<number>('fontSize', 16);

  return (
    <div>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="range"
        min={12}
        max={24}
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
      <span style={{ fontSize }}>{fontSize}px</span>
    </div>
  );
}
```

## More Useful Custom Hooks

### useDebounce

```tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### useMediaQuery

```tsx
import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

### usePrevious

```tsx
import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

## Best Practices

1. **Always start with `use`** — it's required for the linting rules to work
2. **Keep hooks focused** — each hook should do one thing well
3. **Return objects for complex hooks** — lets consumers destructure only what they need
4. **Use TypeScript generics** — makes hooks reusable across different types
5. **Handle errors gracefully** — always wrap localStorage/API calls in try-catch
6. **Memoize callbacks** — use `useCallback` for returned functions to prevent unnecessary re-renders

## When to Extract a Custom Hook

Ask yourself these questions:

| Question | If Yes → |
|----------|----------|
| Is this logic used in 2+ components? | Extract it |
| Is the component getting too complex? | Extract it |
| Does the logic have its own state + effects? | Extract it |
| Would a name make the intent clearer? | Extract it |

## Summary

Custom Hooks are React's answer to **code reuse**. They let you share stateful logic without changing your component hierarchy. The key patterns are:

- **Wrap built-in Hooks** to create domain-specific abstractions
- **Return typed objects** for flexible consumption
- **Clean up effects** in your custom Hooks just as you would in components
- **Compose Hooks** — custom Hooks can call other custom Hooks

> 🎉 **Congratulations!** You've completed the React Hooks module. You now have a solid understanding of useState, useEffect, and how to build your own custom Hooks.
