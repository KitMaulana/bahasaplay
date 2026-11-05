<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
            $table->longText('stem');
            $table->longText('stimulus')->nullable();
            $table->string('image')->nullable();
            $table->string('difficulty')->default('medium'); // easy, medium, hard
            $table->string('category')->nullable();
            $table->longText('explanation')->nullable();
            $table->string('source')->default('manual'); // manual, ai, import
            $table->string('status')->default('published'); // draft, published, archived
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['chapter_id', 'status', 'difficulty']);
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('label', 2); // A, B, C, D, E
            $table->text('text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });

        Schema::create('practice_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->unique()->constrained('chapters')->cascadeOnDelete();
            $table->unsignedTinyInteger('question_count')->default(10);
            $table->json('category_filter')->nullable();
            $table->json('difficulty_mix')->nullable();
            $table->boolean('shuffle_options')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('question_count')->default(10);
            $table->string('selection_mode')->default('random'); // manual, random
            $table->unsignedSmallInteger('duration_minutes')->default(45);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_options')->default(true);
            $table->unsignedTinyInteger('max_attempts')->default(1);
            $table->string('show_review_after')->default('after_submit'); // never, after_submit, after_end
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->unsignedSmallInteger('order')->default(1);
            $table->timestamps();
        });

        Schema::create('exam_class', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['exam_id', 'school_class_id']);
        });

        Schema::create('attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('type'); // practice, exam
            $table->foreignId('exam_id')->nullable()->constrained('exams')->nullOnDelete();
            $table->string('status')->default('in_progress'); // in_progress, submitted, expired
            $table->timestamp('started_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->unsignedSmallInteger('correct_count')->default(0);
            $table->unsignedSmallInteger('total_questions')->default(0);
            $table->boolean('passed')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'chapter_id', 'type']);
            $table->index(['exam_id', 'status']);
        });

        Schema::create('attempt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->unsignedSmallInteger('order')->default(1);
            $table->json('option_map');
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->timestamp('answered_at')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->timestamps();

            $table->index(['attempt_id', 'order']);
        });

        Schema::create('exam_attempt_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('extra_attempts')->default(1);
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['exam_id', 'user_id']);
        });

        Schema::create('chapter_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('learning_status')->default('in_progress'); // locked, in_progress, completed
            $table->string('practice_status')->default('locked'); // locked, available, passed
            $table->string('exam_status')->default('locked'); // locked, available, completed
            $table->decimal('best_practice_score', 5, 2)->nullable();
            $table->decimal('exam_score', 5, 2)->nullable();
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'chapter_id']);
        });

        Schema::create('material_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'material_id']);
        });

        Schema::create('mission_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mission_id')->constrained('missions')->cascadeOnDelete();
            $table->string('status')->default('not_started'); // not_started, in_progress, completed
            $table->json('completed_steps')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'mission_id']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->default('trophy');
            $table->json('rule')->nullable();
            $table->unsignedSmallInteger('xp')->default(100);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnDelete();
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });

        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('xp')->default(0);
            $table->unsignedSmallInteger('level')->default(1);
            $table->json('last_position')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
            $table->unsignedTinyInteger('requested_count')->default(5);
            $table->string('difficulty')->default('medium');
            $table->string('model')->default('gemini-2.5-flash');
            $table->string('status')->default('pending'); // pending, done, failed
            $table->text('error')->nullable();
            $table->unsignedInteger('tokens_used')->nullable();
            $table->string('prompt_hash')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_generation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_generation_id')->constrained('ai_generations')->cascadeOnDelete();
            $table->json('payload');
            $table->string('status')->default('draft'); // draft, approved, rejected
            $table->foreignId('question_id')->nullable()->constrained('questions')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('ai_generation_items');
        Schema::dropIfExists('ai_generations');
        Schema::dropIfExists('user_stats');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('mission_progress');
        Schema::dropIfExists('material_progress');
        Schema::dropIfExists('chapter_progress');
        Schema::dropIfExists('exam_attempt_permissions');
        Schema::dropIfExists('attempt_questions');
        Schema::dropIfExists('attempts');
        Schema::dropIfExists('exam_class');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('practice_configs');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
    }
};
