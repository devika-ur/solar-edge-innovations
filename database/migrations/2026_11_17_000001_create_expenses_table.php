<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Other expenses recorded by the Super Admin.
     */
    public function up(): void
    {
        if (!Schema::hasTable('expenses')) {
            Schema::create('expenses', function (Blueprint $table) {
                $table->id();
                $table->string('title', 150);
                $table->decimal('amount', 12, 2);
                $table->date('expense_date')->index();
                $table->string('payment_method', 50)->default('Cash');
                $table->string('paid_to', 150)->nullable();
                $table->text('notes')->nullable();
                $table->string('created_by', 100)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
