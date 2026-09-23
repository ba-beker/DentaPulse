import { getRequestConfig } from "next-intl/server";
import fr from "../messages/fr.json";

export default getRequestConfig(async () => {
  return {
    locale: "fr",
    messages: fr,
  };
});
