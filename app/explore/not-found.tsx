import { getDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const dict = await getDictionary();

  return <div className="empty-state">{dict.status.exploreNotFound}</div>;
}
