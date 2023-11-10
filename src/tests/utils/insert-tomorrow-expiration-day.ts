import * as fs from 'fs';
/** create string of tomorrow  expiration day */
export const formattedDate = (): string => {
  const tomorrow = new Date();
  const border = 19;

  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().slice(0, border)
    .replace('T', ' ') + '+02';
};

export const updateRefreshTokenExpiry = (filePath: string): void => {
  const userSessionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  userSessionData[0].refresh_token_expires_at = formattedDate();
  fs.writeFileSync(filePath, JSON.stringify(userSessionData, null, 2), 'utf-8');
};
