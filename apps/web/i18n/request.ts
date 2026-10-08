import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import ar from "../messages/ar.json";
import fr from "../messages/fr.json";

export default getRequestConfig(async () => {
  const jar = await cookies();
  const locale = jar.get("dp-locale")?.value === "ar" ? "ar" : "fr";
  return {
    locale,
    messages: locale === "ar" ? ar : fr,
  };
});
