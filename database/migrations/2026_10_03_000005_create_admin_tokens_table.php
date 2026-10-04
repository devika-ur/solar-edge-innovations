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
        Schema::create('admin_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->cascadeOnDelete();
            $table->text('token');
            $table->string('name', 100)->default('Admin API Token');
            $table->dateTime('expires_at');
            $table->dateTime('last_used_at')->nullable();
            $table->enum('status', ['active', 'revoked', 'deleted'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('admin_id', 'idx_admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_tokens');
    }
};
