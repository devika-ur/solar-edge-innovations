<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('staff_name')->default('admin')->index();
                $table->string('action_type', 50)->index(); // deleted, approved, rejected, edited, added, login, logout
                $table->string('record_type', 100)->index(); // Quotation, Agreement, Payment, Project, FAQ, Inquiry, Auth
                $table->string('record_id', 100)->nullable()->index();
                $table->string('record_identifier')->nullable();
                $table->text('details')->nullable();
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent()->index();
            });
        }

        if (Schema::hasTable('admins') && !Schema::hasColumn('admins', 'activity_log_password')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->string('activity_log_password')->nullable()->after('password');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');

        if (Schema::hasTable('admins') && Schema::hasColumn('admins', 'activity_log_password')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->dropColumn('activity_log_password');
            });
        }
    }
};

