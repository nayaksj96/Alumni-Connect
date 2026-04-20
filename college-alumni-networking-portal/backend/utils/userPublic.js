/** Shape returned to clients (no password). */
export const toPublicUser = (user) => {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  u.branch = u.branch || u.major;
  return u;
};
