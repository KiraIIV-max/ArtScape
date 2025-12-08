<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use Carbon\Carbon;

class CloseExpiredAuctions extends Command
{
    // The name you will call in the scheduler
    protected $signature = 'auctions:close-expired';

    protected $description = 'Finds active auctions past their end_date and closes them.';

    public function handle()
    {
        $now = Carbon::now();

        // 1. Find auctions that are 'active' BUT the time has passed
        $expiredAuctions = Auction::where('status', Auction::STATUS_ACTIVE)
                                  ->where('end_date', '<', $now)
                                  ->get();

        foreach ($expiredAuctions as $auction) {
            
            // Check if there are bids
            $highestBid = $auction->bids()->orderBy('amount', 'desc')->first();

            if ($highestBid) {
                // Determine Winner
                $auction->status = Auction::STATUS_PENDING; // Pending Payment
                $auction->current_highest_bid = $highestBid->amount;
                // You might trigger a notification to the winner here
            } else {
                // No bids, just close it
                $auction->status = Auction::STATUS_CLOSED;
            }

            $auction->save();
            
            $this->info("Closed Auction ID: {\$auction->id}");
        }

        $this->info('Check complete.');
    }
}