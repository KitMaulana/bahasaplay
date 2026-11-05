<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('number');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('setting_location')->nullable();
            $table->unsignedTinyInteger('kkm')->default(75);
            $table->unsignedSmallInteger('order')->default(1);
            $table->string('status')->default('published');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('type'); // learning, practice, exam
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('map_key')->default('cilegon');
            $table->string('area_key')->default('alun_alun');
            $table->json('config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['chapter_id', 'type']);
        });

        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->json('media')->nullable();
            $table->unsignedSmallInteger('order')->default(1);
            $table->boolean('is_required')->default(true);
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('npcs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->string('name');
            $table->string('role_label');
            $table->json('appearance')->nullable();
            $table->json('position')->nullable();
            $table->float('rotation_y')->default(0);
            $table->text('greeting')->nullable();
            $table->timestamps();
        });

        Schema::create('dialogues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('npc_id')->constrained('npcs')->cascadeOnDelete();
            $table->string('key')->default('default');
            $table->json('nodes');
            $table->timestamps();
        });

        Schema::create('interactables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->string('type')->default('board');
            $table->string('label');
            $table->json('position')->nullable();
            $table->string('model_key')->nullable();
            $table->json('action')->nullable();
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('order')->default(1);
            $table->boolean('is_required')->default(true);
            $table->unsignedSmallInteger('reward_xp')->default(50);
            $table->timestamps();
        });

        Schema::create('mission_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained('missions')->cascadeOnDelete();
            $table->unsignedSmallInteger('order')->default(1);
            $table->string('type');
            $table->json('target_ref')->nullable();
            $table->json('payload')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_steps');
        Schema::dropIfExists('missions');
        Schema::dropIfExists('interactables');
        Schema::dropIfExists('dialogues');
        Schema::dropIfExists('npcs');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('zones');
        Schema::dropIfExists('chapters');
    }
};
