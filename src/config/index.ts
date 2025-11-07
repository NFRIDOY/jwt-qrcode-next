// Server-side only config
// JWT_SECRET should never be accessed from client components
export const config = {
    jwt_secret: process.env.JWT_SECRET || (() => {
        // This will only be called server-side
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('⚠️ JWT_SECRET environment variable is not set!');
            console.error('Please create a .env.local file with JWT_SECRET=your-secret-key');
        }
        return secret || '';
    })(),
}