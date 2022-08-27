<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEscrowTransfersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('escrow_transfers', function (Blueprint $table) {
            $table->id();
            $table->integer("escrow_id")->nullable();
            $table->integer("user_id")->nullable();
            $table->string("user_from")->nullable();
            $table->string("user_to")->nullable();
            $table->enum("payment_type", ['debit', 'credit'])->default(NULL);
            $table->decimal('amount', 10, 6)->nullable();
            $table->string("token")->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled', 'delivered', 'completed'])->default('pending');
            $table->timestamp('date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('escrow_transfers');
    }
}
