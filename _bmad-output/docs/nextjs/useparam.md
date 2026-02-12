# useParams

Last updated June 16, 2025

`useParams` is a **Client Component** hook that lets you read a route's [dynamic params](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) filled in by the current URL.

app/example-client-component.tsx

TypeScript

JavaScriptTypeScript

```
'use client'

import { useParams } from 'next/navigation'

export default function ExampleClientComponent() {
  const params = useParams<{ tag: string; item: string }>()

  // Route -> /shop/[tag]/[item]
  // URL -> /shop/shoes/nike-air-max-97
  // `params` -> { tag: 'shoes', item: 'nike-air-max-97' }
  console.log(params)

  return '...'
}
```

## Parameters [Link to this section](https://nextjs.org/docs/app/api-reference/functions/use-params\#parameters)

```
const params = useParams()
```

`useParams` does not take any parameters.

## Returns [Link to this section](https://nextjs.org/docs/app/api-reference/functions/use-params\#returns)

`useParams` returns an object containing the current route's filled in [dynamic parameters](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes).

- Each property in the object is an active dynamic segment.
- The properties name is the segment's name, and the properties value is what the segment is filled in with.
- The properties value will either be a `string` or array of `string`'s depending on the [type of dynamic segment](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes).
- If the route contains no dynamic parameters, `useParams` returns an empty object.
- If used in Pages Router, `useParams` will return `null` on the initial render and updates with properties following the rules above once the router is ready.

For example:

| Route | URL | `useParams()` |
| --- | --- | --- |
| `app/shop/page.js` | `/shop` | `{}` |
| `app/shop/[slug]/page.js` | `/shop/1` | `{ slug: '1' }` |
| `app/shop/[tag]/[item]/page.js` | `/shop/1/2` | `{ tag: '1', item: '2' }` |
| `app/shop/[...slug]/page.js` | `/shop/1/2` | `{ slug: ['1', '2'] }` |

## Version History [Link to this section](https://nextjs.org/docs/app/api-reference/functions/use-params\#version-history)

