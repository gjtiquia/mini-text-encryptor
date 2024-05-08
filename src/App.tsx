import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainView } from "./MainView";

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MainView />
        </QueryClientProvider>
    )
}

export default App
