const programmeSessionLeadFirstNames = ["Sandra", "Rajiv", "Cherlene"] as const;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0]?.toLocaleLowerCase("en") ?? "";
}

/** Published practitioners who can lead a programme, in the requested order. A missing or ambiguous first name is left out. */
export function selectProgrammeSessionLeads<T extends { name: string }>(
  practitioners: readonly T[],
): T[] {
  return programmeSessionLeadFirstNames.flatMap((lead) => {
    const matches = practitioners.filter(
      (practitioner) => firstName(practitioner.name) === lead.toLocaleLowerCase("en"),
    );
    return matches.length === 1 ? [matches[0]] : [];
  });
}
