# Error Boundaries (React Start)

TanStack Start utilizes TanStack Router's route-level error boundaries to handle runtime errors gracefully.

- **Default Configuration**: Set a global error component for all routes via the router.
- **Per-Route Override**: Customize error handling for specific routes using the `errorComponent` option.

### Configure a Default

To set a global error boundary, use the `defaultErrorComponent` property when creating your router instance.

```tsx
// src/router.tsx
import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    // Shown when an error bubbles to the router
    defaultErrorComponent: ({ error, reset }) => (
      <ErrorComponent error={error} />
    ),
  });
  return router;
}
```

### Per-Route Override

You can override the default error component on a specific route by providing an `errorComponent` to `createFileRoute`.

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

function PostError({ error, reset }: ErrorComponentProps) {
  return (
    <div>
      <p>An error occurred while loading this post.</p>
      <ErrorComponent error={error} />
      <button onClick={() => reset()}>Retry</button>
    </div>
  );
}

export const Route = createFileRoute("/posts/$postId")({
  component: PostComponent,
  errorComponent: PostError,
});
```

### Key Concepts

- **`ErrorComponent`**: A built-in UI component provided by TanStack Router for basic error display.
- **`reset()`**: A function provided to the error component that allows the user to retry rendering the route (useful after fixing state or network issues).
- **Error Bubbling**: Errors thrown in `beforeLoad` or `loader` functions will bubble up to the nearest error boundary.
