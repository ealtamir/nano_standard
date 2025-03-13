import { JSX } from "preact";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb(
  { items, className = "" }: BreadcrumbProps,
): JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className={`w-full mb-3 ${className}`}>
      <ol className="flex flex-wrap items-center text-sm text-neutral/80">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="mx-2 h-4 w-4 text-neutral/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}

            {item.href && !item.active
              ? (
                <a
                  href={item.href}
                  className="hover:text-accent transition-colors"
                >
                  {item.label}
                </a>
              )
              : (
                <span className={item.active ? "font-medium text-accent" : ""}>
                  {item.label}
                </span>
              )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
