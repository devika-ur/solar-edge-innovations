<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Older quotation reopen entries were logged as 'edited'. Relabel them as 'reopened'
     * so they show up under the new "Reopened" action in the Activity Log.
     */
    public function up(): void
    {
        if (Schema::hasTable('activity_logs')) {
            DB::table('activity_logs')
                ->where('action_type', 'edited')
                ->where('details', 'like', 'Authorized reopening of quotation%')
                ->update(['action_type' => 'reopened']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('activity_logs')) {
            DB::table('activity_logs')
                ->where('action_type', 'reopened')
                ->where('details', 'like', 'Authorized reopening of quotation%')
                ->update(['action_type' => 'edited']);
        }
    }
};
