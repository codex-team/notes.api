/** create string of tomorrow  expiration day */
export const formattedDate = (): string => {
  const tomorrow = new Date();
  const border = 19;


  tomorrow.setDate(tomorrow.getDate() + 1);

  const newExpirationDay: string = tomorrow.toISOString().slice(0, border)
    .replace('T', ' ') + '+02';

  return newExpirationDay;
};
// Export the newExpirationDay variable directly
export const newExpirationDay: string = formattedDate();

