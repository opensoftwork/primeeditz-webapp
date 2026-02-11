## Richer useQuery

Use in place of `useQuery` from "convex/react" to fetch data from a query, with
a richer return value.

By default, `useQuery` will throw an error when the server throws. It also
returns `undefined` to indicate a "loading" state. This helper returns:

```ts
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex/react";
// Do this once somewhere, name it whatever you want.
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

const { status, data, error, isSuccess, isPending, isError } =
  useQueryWithStatus(api.foo.bar, { myArg: 123 });
```

The types of the return is:

```ts
type ret =
  | {
      status: "success";
      data: FunctionReturnType<Query>;
      error: undefined;
      isSuccess: true;
      isPending: false;
      isError: false;
    }
  | {
      status: "pending";
      data: undefined;
      error: undefined;
      isSuccess: false;
      isPending: true;
      isError: false;
    }
  | {
      status: "error";
      data: undefined;
      error: Error;
      isSuccess: false;
      isPending: false;
      isError: true;
    };
```
