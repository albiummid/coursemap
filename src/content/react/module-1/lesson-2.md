---
title: "Managing State with useState"
duration: "15 min"
order: 2
tags: ["hooks", "useState", "state-management", "intermediate"]
description: "Master the useState hook — from basic counters to complex state objects, lazy initialization, and common pitfalls."
---

## Deep Dive into useState

The `useState` hook is the most fundamental Hook in React. Let's explore every aspect of it.

## Basic Syntax

```tsx
const [state, setState] = useState<Type>(initialValue);
```

The generic type parameter `<Type>` tells TypeScript what kind of value this state holds.

## Working with Different Types

### Primitive Values

```tsx
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');
const [isVisible, setIsVisible] = useState<boolean>(false);
```

### Objects

When working with objects, always create a **new reference**:

```tsx
interface UserProfile {
  name: string;
  email: string;
  age: number;
}

function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 28,
  });

  const updateName = (newName: string): void => {
    // ✅ Correct: spread to create new object
    setProfile(prev => ({ ...prev, name: newName }));

    // ❌ Wrong: mutating state directly
    // profile.name = newName;
  };

  return (
    <div>
      <input
        value={profile.name}
        onChange={(e) => updateName(e.target.value)}
      />
      <p>{profile.email} — Age: {profile.age}</p>
    </div>
  );
}
```

### Arrays

```tsx
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string): void => {
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, done: false }
    ]);
  };

  const toggleTodo = (id: number): void => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const removeTodo = (id: number): void => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <span style={{
            textDecoration: todo.done ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
          <button onClick={() => toggleTodo(todo.id)}>Toggle</button>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

## Lazy Initialization

If the initial state is expensive to compute, pass a **function** to `useState`:

```tsx
// ❌ computeExpensiveValue() runs on EVERY render
const [data, setData] = useState(computeExpensiveValue());

// ✅ computeExpensiveValue() runs only on FIRST render
const [data, setData] = useState(() => computeExpensiveValue());
```

> **When to use lazy init:** When reading from `localStorage`, parsing large data, or performing any computation that doesn't need to repeat on re-renders.

### Real-World Example

```tsx
function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return JSON.parse(stored) as T;
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
```

## Common Pitfalls

### Pitfall 1: Stale Closures

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = (): void => {
    // ❌ Both use the same stale `count` value
    setCount(count + 1);
    setCount(count + 1);
    // Result: count only increments by 1!

    // ✅ Use the functional updater
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    // Result: count increments by 2!
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

### Pitfall 2: Object Identity

```tsx
// ❌ This won't trigger a re-render
const [user, setUser] = useState({ name: 'Alice' });
user.name = 'Bob';
setUser(user); // Same reference!

// ✅ Always create a new object
setUser({ ...user, name: 'Bob' });
```

## State Update Batching

React **batches** state updates that happen during event handlers:

```tsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (): void => {
    setName('Jane');   // Does NOT trigger re-render yet
    setEmail('j@e.com'); // Does NOT trigger re-render yet
    // React batches both → single re-render
  };
}
```

In React 18+, batching also works in `setTimeout`, `Promise`, and native events.

## Summary

| Pattern | Example |
|---------|---------|
| Basic state | `useState<number>(0)` |
| Object state | `useState<User>({ name: '' })` |
| Array state | `useState<Todo[]>([])` |
| Lazy init | `useState(() => expensive())` |
| Functional update | `setState(prev => prev + 1)` |

> 💡 **Next Module:** We'll explore `useEffect` for handling side effects like API calls, timers, and subscriptions.
