import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ token: string }> };

export default async function InviteRedirectPage({ params }: PageProps) {
  const { token } = await params;
  redirect(`/learn/${token}`);
}
