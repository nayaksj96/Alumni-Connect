/** Block content creation for alumni awaiting admin approval */
export const assertAlumniCanPublish = (user) => {
  if (user.role === 'alumni' && user.alumniApprovalStatus === 'pending') {
    const err = new Error('Your alumni account is pending admin approval.');
    err.status = 403;
    throw err;
  }
};
