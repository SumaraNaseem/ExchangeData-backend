import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Assuming User model is defined elsewhere or in the same file as register route
// If your User model is in app/api/register/route.js, you might need to import it.
// For now, I will define a simple schema/model here for demonstration.
// In a real app, you'd likely have a dedicated models folder.

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

export async function POST(request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // If credentials are valid, return success (and potentially a token)
        // For now, mimicking the existing app's local storage behavior, 
        // we'll just return success. A real auth system would issue a JWT here.

        // You might want to return some user info as well, excluding the password
        const userWithoutPassword = {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
        };

        return NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword, access_token: 'fake-token' }, // Provide a fake token for local storage
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'An error occurred during login' },
            { status: 500 }
        );
    }
} 