"use client"

import { QueryClientProvider} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { getQueryClient } from "./get-query-client"


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={getQueryClient()}>
            {children}
            <ReactQueryDevtools />
        </QueryClientProvider>
    )
}
