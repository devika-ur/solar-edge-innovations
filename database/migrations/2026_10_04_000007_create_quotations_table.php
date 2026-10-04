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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('ref_no', 100)->nullable();
            $table->string('client_name', 150);
            $table->string('client_phone', 50)->nullable();
            $table->string('client_address', 255)->nullable();
            $table->string('capacity', 50)->nullable();
            $table->string('system_type', 100)->nullable();
            $table->string('total_amount', 100)->nullable();
            $table->string('quotation_date', 50)->nullable();
            $table->string('pdf_path', 255)->nullable();
            $table->string('pdf_url', 255)->nullable();
            $table->enum('status', ['active', 'archived', 'deleted'])->default('active');
            $table->string('created_by', 100)->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('client_name');
            $table->index('ref_no');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
