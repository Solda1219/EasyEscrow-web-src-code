<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMultipleColumnToEscrow extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('escrows', function (Blueprint $table) {
            $table->string("escrow_contract_id","255")->nulalble()->after('type_id'); 
            DB::statement("ALTER TABLE escrows MODIFY COLUMN status ENUM('ready','cancelled','completed') DEFAULT 'ready'");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('escrow', function (Blueprint $table) {
            //
        });
    }
}
