export interface CatalogDrug {
  id: string;
  dci: string;
  brand?: string;
  aliases: readonly string[];
}

/**
 * Common dental prescriptions in Algeria, by DCI and brand.
 * A cabinet can add, rename, or hide entries; this list stays the safety baseline.
 */
export const COMMON_DRUGS = [
  {
    id: "amoxicilline",
    dci: "Amoxicilline",
    brand: "Clamoxyl",
    aliases: ["Amoxil", "Amodex"],
  },
  {
    id: "amoxicilline-clavulanique",
    dci: "Amoxicilline et acide clavulanique",
    brand: "Augmentin",
    aliases: ["Augmentin"],
  },
  {
    id: "metronidazole",
    dci: "Métronidazole",
    brand: "Flagyl",
    aliases: ["Flagyl"],
  },
  {
    id: "spiramycine",
    dci: "Spiramycine",
    brand: "Rovamycine",
    aliases: ["Rovamycine"],
  },
  {
    id: "azithromycine",
    dci: "Azithromycine",
    brand: "Zithromax",
    aliases: ["Azithromycine"],
  },
  {
    id: "clindamycine",
    dci: "Clindamycine",
    brand: "Dalacine",
    aliases: ["Dalacine"],
  },
  {
    id: "ibuprofene",
    dci: "Ibuprofène",
    brand: "Advil",
    aliases: ["Nurofen", "Brufen"],
  },
  {
    id: "paracetamol",
    dci: "Paracétamol",
    brand: "Doliprane",
    aliases: ["Efferalgan", "Panadol"],
  },
  {
    id: "acide-mefenamique",
    dci: "Acide méfénamique",
    brand: "Ponstan",
    aliases: ["Ponstan"],
  },
  {
    id: "diclofenac",
    dci: "Diclofénac",
    brand: "Voltarène",
    aliases: ["Voltarene"],
  },
  {
    id: "prednisolone",
    dci: "Prednisolone",
    brand: "Solupred",
    aliases: ["Solupred"],
  },
  {
    id: "tramadol",
    dci: "Tramadol",
    brand: "Contramal",
    aliases: ["Contramal"],
  },
  {
    id: "codeine-paracetamol",
    dci: "Codéine et paracétamol",
    brand: "Codoliprane",
    aliases: ["Codoliprane"],
  },
  {
    id: "chlorhexidine",
    dci: "Chlorhexidine",
    brand: "Eludril",
    aliases: ["Paroex"],
  },
] as const satisfies readonly CatalogDrug[];

export function catalogDrugById(id: string): CatalogDrug | undefined {
  return COMMON_DRUGS.find((drug) => drug.id === id);
}
