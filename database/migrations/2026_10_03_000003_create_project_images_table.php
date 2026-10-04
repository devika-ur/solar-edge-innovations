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
        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('image_path', 255);
            $table->string('image_alt', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'deleted'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('project_id', 'idx_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_images');
    }
};
