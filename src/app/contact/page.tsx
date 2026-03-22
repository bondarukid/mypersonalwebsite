import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact page — content coming soon.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Contact
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Content coming soon.
      </p>
    </div>
  );
}
