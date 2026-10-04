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
        // 1. Master Table: Stores payment tracking summary for each quotation
        Schema::create('quotation_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
            $table->string('ref_no', 100)->nullable();
            $table->string('client_name', 150);
            $table->string('client_phone', 50)->nullable();
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->decimal('amount_paid', 12, 2)->default(0.00);
            $table->decimal('balance_amount', 12, 2)->default(0.00);
            $table->enum('status', ['pending', 'partially_paid', 'paid'])->default('pending');
            $table->dateTime('last_payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('quotation_id');
            $table->index('status');
            $table->index('ref_no');
            $table->index('client_name');
        });

        // 2. History Table: Stores individual payment transactions/receipts
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_payment_id')->constrained('quotation_payments')->onDelete('cascade');
            $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
            $table->decimal('payment_amount', 12, 2);
            $table->decimal('total_paid_after', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->string('payment_method', 50)->default('Cash');
            $table->string('transaction_reference', 100)->nullable();
            $table->dateTime('payment_date');
            $table->text('notes')->nullable();
            $table->string('recorded_by', 100)->nullable()->default('admin');
            $table->timestamps();

            $table->index('quotation_payment_id');
            $table->index('quotation_id');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_histories');
        Schema::dropIfExists('quotation_payments');
    }
};
