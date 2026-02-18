---
title: "Introduction to React Hooks"
duration: "12 min"
order: 1
tags: ["hooks", "state", "beginner"]
description: "Learn what React Hooks are, why they exist, and how they changed the way we write React components."
---

## What Are React Hooks?

React Hooks are functions that let you **"hook into"** React state and lifecycle features from function components. Before Hooks, you needed class components to manage state or run side effects. Hooks changed everything.

> **Key Insight:** Hooks don't replace your knowledge of React concepts. Instead, they provide a more direct API to the React concepts you already know — props, state, context, refs, and lifecycle.

## Why Hooks Were Introduced

The React team introduced Hooks in **React 16.8** to solve three main problems:

1. **Reusing stateful logic** between components was hard
2. **Complex components** became difficult to understand
3. **Classes** confused both people and machines

### The Problem with Classes

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

### The Hooks Solution

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Notice how much cleaner and more readable the Hooks version is!

## Rules of Hooks

There are two essential rules you must follow:

| Rule | Description |
|------|-------------|
| **Only call at the top level** | Don't call Hooks inside loops, conditions, or nested functions |
| **Only call from React functions** | Call them from function components or custom Hooks |

## The Core Hooks

React provides several built-in Hooks:

- **`useState`** — Adds state to function components
- **`useEffect`** — Runs side effects after render
- **`useContext`** — Subscribes to React context
- **`useRef`** — Persists values between renders
- **`useMemo`** — Memoizes expensive computations
- **`useCallback`** — Memoizes functions
- **`useReducer`** — Complex state management

## Quick Example: useState

```tsx
import { useState } from 'react';

function Toggle() {
  const [isOn, setIsOn] = useState<boolean>(false);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? '🔵 ON' : '⚫ OFF'}
    </button>
  );
}
```

### How It Works

1. `useState(false)` declares a state variable initialized to `false`
2. It returns an array: `[currentValue, setterFunction]`
3. When `setIsOn` is called, React **re-renders** the component with the new value

## Summary

Hooks provide a powerful, composable way to add state and logic to your React components without the overhead of classes. In the next lesson, we'll dive deep into `useState` and explore advanced patterns.

> 💡 **Next Up:** We'll explore `useState` in depth — including working with objects, arrays, and lazy initialization.
