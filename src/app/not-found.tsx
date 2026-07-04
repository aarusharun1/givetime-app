import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1
          className="font-sora font-extrabold text-4xl mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Page not found
        </h1>
        <p
          className="font-inter text-base mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          The organization you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-inter font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--green-primary)" }}
        >
          Back to all organizations
        </Link>
      </div>
    </div>
  );
}
