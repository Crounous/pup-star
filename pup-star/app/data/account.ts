import fs from 'fs';
import path from 'path';

// Define the structure of our credentials data
interface Credentials {
  username: string;
  password: string;
  securityCode: string;
}

// Path to our JSON file that will act as a simple database.
// process.cwd() points to the root of your project.
const dbPath = path.join(process.cwd(), 'src', 'lib', 'credentials.json');

// Function to read the credentials from the file
export const getCredentials = (): Credentials => {
  // If the file doesn't exist, create it with default values
  if (!fs.existsSync(dbPath)) {
    const defaultCredentials = {
      username: 'admin',
      password: 'password123',
      securityCode: 'PUPSTARMALUPWET',
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultCredentials, null, 2));
    return defaultCredentials;
  }

  const fileContents = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(fileContents);
};

// Function to save the updated credentials to the file
export const saveCredentials = (newCredentials: Credentials): void => {
  fs.writeFileSync(dbPath, JSON.stringify(newCredentials, null, 2));
};