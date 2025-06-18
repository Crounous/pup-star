import { NextResponse, NextRequest } from 'next/server';
import { getCredentials, saveCredentials } from '@/app/data/account'; // Adjust path if needed

// This function handles POST requests to /api/auth/update-password
export async function POST(request: NextRequest) {
  try {
    // 1. Get the current, real credentials from our "database"
    const currentCredentials = getCredentials();

    // 2. Get the data the user submitted from the frontend
    const { securityCode, newPassword, confirmPassword } = await request.json();

    // 3. Perform validation on the server
    if (securityCode !== currentCredentials.securityCode) {
      // Return an error response if the security code is wrong
      return NextResponse.json({ message: 'Invalid Security Code.' }, { status: 401 });
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match or are missing.' }, { status: 400 });
    }

    // 4. If all checks pass, update the credentials
    const updatedCredentials = {
      ...currentCredentials,
      password: newPassword,
    };
    
    // Save the new password permanently
    saveCredentials(updatedCredentials);

    // 5. Return a success response
    return NextResponse.json({ message: 'Password updated successfully!' }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    // Return a generic server error
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}