---
title: "Side Effects with useEffect"
duration: "18 min"
order: 1
tags: ["hooks", "useEffect", "side-effects", "lifecycle", "intermediate"]
videoUrl: "https://www.youtube.com/embed/0ZJgIjIuY7U"
description: "Master useEffect — the Hook for side effects including data fetching, subscriptions, timers, and cleanup patterns."
---

## Understanding Side Effects

A **side effect** is anything that affects something outside the scope of the current function — API calls, timers, DOM manipulation, logging, and subscriptions.

> In React, the `useEffect` Hook lets you synchronize a component with an external system.

## Watch: useEffect Explained

Check out this video walkthrough for a visual explanation of how `useEffect` works under the hood:

## Basic Syntax

```tsx
useEffect(() => {
  // Effect code runs after render
  
  return () => {
    // Cleanup code runs before next effect or unmount
  };
}, [dependencies]);
```

The **dependency array** controls when the effect re-runs:

| Dependency Array | When it Runs |
|:---:|:---|
| `undefined` (omitted) | After **every** render |
| `[]` (empty) | Only after the **first** render |
| `[a, b]` | When `a` or `b` **changes** |

## Data Fetching Example

```tsx
interface Post {
  id: number;
  title: string;
  body: string;
}

function PostViewer({ postId }: { postId: number }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${postId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: Post = await response.json();

        if (!cancelled) {
          setPost(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    void fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return null;

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
}
```

### Why the Cleanup?

The `cancelled` flag prevents **race conditions**. If `postId` changes while a fetch is in-flight, the old response won't update state.

## Timer Effects

```tsx
function Timer() {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup: clear the interval on unmount
    return () => clearInterval(id);
  }, []); // Empty deps → runs once

  return <p>Elapsed: {seconds}s</p>;
}
```

## Event Listener Pattern

```tsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = (): void => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <p>
      Window: {size.width} × {size.height}
    </p>
  );
}
```

## Common Mistakes

### Mistake 1: Missing Dependencies

```tsx
// ❌ ESLint will warn about missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // userId is used but not in deps!

// ✅ Include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Mistake 2: Object/Array Dependencies

```tsx
// ❌ New object reference every render → infinite loop!
useEffect(() => {
  doSomething(options);
}, [{ page: 1, limit: 10 }]);

// ✅ Use primitive values or useMemo
const page = 1;
const limit = 10;

useEffect(() => {
  doSomething({ page, limit });
}, [page, limit]);
```

### Mistake 3: Forgetting Cleanup

```tsx
// ❌ Memory leak: listener never removed
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
});

// ✅ Always clean up subscriptions
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## Effect Lifecycle Diagram

```
Component Mounts
     ↓
  Render
     ↓
  useEffect runs
     ↓
State/Prop Changes
     ↓
  Re-render
     ↓
  Previous cleanup runs
     ↓
  useEffect runs again
     ↓
Component Unmounts
     ↓
  Final cleanup runs
```

## Summary

- `useEffect` synchronizes your component with external systems
- Always specify **dependencies** correctly
- Always **clean up** subscriptions, timers, and listeners
- Use the `cancelled` flag pattern for async operations
- Don't fight the dependency array — embrace it

> 💡 **Next Up:** We'll build our own **custom Hooks** to extract and reuse stateful logic across components.
