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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('space_id')->constrained()->onDelete('cascade');
            $table->string('event_name');
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->enum('status', ['confirmed', 'cancelled'])->default('confirmed');
            $table->timestamps();
            $table->softDeletes();

            // Índice compuesto para optimizar consultas de disponibilidad
            $table->index(['space_id', 'start_time', 'end_time'], 'reservations_availability_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
