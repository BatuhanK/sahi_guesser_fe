import { lazy, Suspense } from "react";

const ReactMarkdown = lazy(() => import("react-markdown"));

export function LazyMarkdown({ children }: { children: string }) {
  return (
    <Suspense fallback={<span>{children}</span>}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </Suspense>
  );
}
