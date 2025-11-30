import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // API 실패시 재시도 횟수
      refetchOnWindowFocus: false, // 윈도우 포커스시 자동 재요청 방지
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
