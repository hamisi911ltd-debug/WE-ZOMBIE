import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test")({
  component: TestPage,
});

function TestPage() {
  return (
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Test Page Works!</h1>
        <p>If you see this, the Worker is running.</p>
      </body>
    </html>
  );
}
