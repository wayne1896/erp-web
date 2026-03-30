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
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('company_name', 255);
            $table->string('legal_name', 255)->nullable();
            $table->string('rnc', 20)->unique();
            $table->string('address', 500);
            $table->string('phone', 50);
            $table->string('email', 255);
            $table->string('website', 255)->nullable();
            $table->string('logo_path', 500)->nullable();
            $table->string('branch_name', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('taxpayer_type', 50)->default('REGULAR');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
