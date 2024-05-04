import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InnerApp } from "./InnerApp";

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <InnerApp />
        </QueryClientProvider>
    )
}

export default App
