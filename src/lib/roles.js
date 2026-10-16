export const ROLES = {
  DMC_OFFICER: "DMC Officer",
  DISTRICT_OFFICER: "District Officer",
};

export function hasRole(session, roles) {
  return Boolean(session?.user && roles.includes(session.user.role));
}

// Each role has its own area: DMC Officers verify reports, District Officers manage shelters
const HOME_PATHS = {
  [ROLES.DMC_OFFICER]: "/dashboard",
  [ROLES.DISTRICT_OFFICER]: "/shelters",
};

/** Where an officer lands after signing in, or null if the role has no admin area. */
export function homePathFor(session) {
  return HOME_PATHS[session?.user?.role] ?? null;
}
