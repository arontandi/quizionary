import * as path from 'path';

export const firebaseConfig = {
  serviceAccount: path.resolve(process.cwd(), 'config/firebaseAdminConfig.json'),
};
