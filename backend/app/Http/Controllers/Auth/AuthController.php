<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'role' => ['required', Rule::in(['buyer', 'artist'])],
            'city' => 'required|string|max:255',
            'national_id' => 'required|string|max:14',
        ]);

        // Buyers auto approved, artists pending
        $status = $request->role === 'buyer' ? 'approved' : 'pending';

        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'phone'       => $request->phone,   // FIXED
            'role'        => $request->role,
            'status'      => $status,
            'city'        => $request->city,    // FIXED
            'national_id' => $request->national_id, // FIXED
        ]);

        // Return token only for approved users (buyers)
        if ($status === 'approved') {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
            ]);
        }

        return response()->json([
            'message' => 'Registration submitted. Awaiting admin approval.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Only approved non-admins can log in
        if ($user->role !== 'admin' && $user->status !== 'approved') {
            return response()->json([
                'message' => 'Your account is pending admin approval.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
