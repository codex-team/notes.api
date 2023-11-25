/**
 * Returns tomorrow date in DB compatible format
 */
export const getTomorrowDateFormatted = (): string => {
  const tomorrow = new Date();
  const border = 19;

  tomorrow.setDate(tomorrow.getDate() + 1);

  const newExpirationDay: string = tomorrow.toISOString().slice(0, border)
    .replace('T', ' ') + '+02';

  return newExpirationDay;
};

