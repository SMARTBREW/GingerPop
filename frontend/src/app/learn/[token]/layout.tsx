export function generateStaticParams() {
  return [{ token: "_" }];
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
