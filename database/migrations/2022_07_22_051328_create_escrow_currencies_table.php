<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEscrowCurrenciesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('escrow_currencies', function (Blueprint $table) {
            $table->id();
            $table->string('currency',10)->unique()->nullable(false);
            $table->string('cur_title',25)->nullable();
            $table->string('cur_contract',100)->nullable();
            $table->integer('cur_decimals')->nullable();
            $table->text('cur_description')->nullable();
            $table->text('cur_chainurl')->nullable();
            $table->string('cur_symbol',50)->nullable();
            $table->enum('curr_status', ['active','pending'])->default('active');
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
        Schema::dropIfExists('escrow_currencies');
    }
}
