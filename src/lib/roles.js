export const ROLES = {
  DMC_OFFICER: "DMC Officer",
  DISTRICT_OFFICER: "District Officer",
};

export const ADMIN_ROLES = [ROLES.DMC_OFFICER, ROLES.DISTRICT_OFFICER];

export function hasRole(session, roles) {
  return Boolean(session?.user && roles.includes(session.user.role));
}

export function isAdmin(session) {
  return hasRole(session, ADMIN_ROLES);
}

export function isDmcOfficer(session) {
  return hasRole(session, [ROLES.DMC_OFFICER]);
}
