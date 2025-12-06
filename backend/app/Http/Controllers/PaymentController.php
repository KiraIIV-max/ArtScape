<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:15',
            'payment_status' => 'nullable|string|max:20',
            'user_id' => 'required|exists:users,user_id',
            'auction_id' => 'required|exists:auctions,auction_id',
        ]);

        $payment = Payment::create($validated);
        return response()->json($payment, 201);
    }

    public function show($id)
    {
        return response()->json(Payment::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update($request->all());
        return response()->json($payment);
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->json(['message' => 'Payment deleted']);
    }
}
