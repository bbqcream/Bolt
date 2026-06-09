import { getDictionary } from "@/lib/i18n";

export default async function Loading() {
  const dict = await getDictionary();

  return <div className="empty-state">{dict.status.exploreLoading}</div>;
}
