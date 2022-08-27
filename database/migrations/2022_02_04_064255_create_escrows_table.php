<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


class CreateEscrowsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('escrows', function (Blueprint $table) {
            $table->id();
            $table->integer("type_id");
            $table->integer("parent_id")->nullable();
            $table->integer("user_id")->nullable();
            $table->decimal('amount', 10, 6)->nullable();
            $table->string("token")->nullable();
            $table->text("description")->nullable();
            $table->integer("trade_user_id")->nullable();
            $table->string("trade_username")->nullable();
            $table->string("trade_token")->nullable();
            $table->decimal('trade_amount', 10, 6)->nullable();
            $table->enum("transfer_type", ['immediatly', 'delivery'])->default(NULL);
            $table->timestamp('transfer_datetime')->nullable();
            $table->enum("pool_type", ['date', 'inetger'])->default(NULL);
            $table->text("pool_options")->nullable();
            $table->string("pool_outcome")->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled', 'delivered', 'completed'])->default('pending');
            $table->timestamp('status_change_at')->nullable();
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
        Schema::dropIfExists('escrows');
    }
}
