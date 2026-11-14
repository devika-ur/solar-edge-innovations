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
        // 1. Extend quotations table with workflow tracking and JSON data
        Schema::table('quotations', function (Blueprint $table) {
            if (!Schema::hasColumn('quotations', 'workflow_status')) {
                $table->string('workflow_status', 50)->default('approval_pending')->after('status');
                $table->index('workflow_status');
            }
            if (!Schema::hasColumn('quotations', 'quotation_data')) {
                $table->longText('quotation_data')->nullable()->after('total_amount');
            }
            if (!Schema::hasColumn('quotations', 'approved_at')) {
                $table->dateTime('approved_at')->nullable()->after('workflow_status');
            }
            if (!Schema::hasColumn('quotations', 'rejected_at')) {
                $table->dateTime('rejected_at')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('quotations', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('rejected_at');
            }
            if (!Schema::hasColumn('quotations', 'agreement_created_at')) {
                $table->dateTime('agreement_created_at')->nullable()->after('rejection_reason');
            }
            if (!Schema::hasColumn('quotations', 'completed_at')) {
                $table->dateTime('completed_at')->nullable()->after('agreement_created_at');
            }
        });

        // 2. Create agreements table to store completed agreements linked to quotations
        if (!Schema::hasTable('agreements')) {
            Schema::create('agreements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
                $table->string('consumer_name', 150);
                $table->text('consumer_address')->nullable();
                $table->string('agreement_date', 50)->nullable();
                $table->longText('agreement_data')->nullable();
                $table->string('pdf_path', 255)->nullable();
                $table->string('pdf_url', 255)->nullable();
                $table->string('status', 50)->default('saved');
                $table->string('created_by', 100)->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('quotation_id');
                $table->index('status');
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agreements');

        Schema::table('quotations', function (Blueprint $table) {
            $columns = [
                'workflow_status',
                'quotation_data',
                'approved_at',
                'rejected_at',
                'rejection_reason',
                'agreement_created_at',
                'completed_at',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('quotations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
