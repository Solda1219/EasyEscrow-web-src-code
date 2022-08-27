<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeDatatypeToEscrowTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('escrow', function (Blueprint $table) {
            DB::statement("ALTER TABLE escrows MODIFY COLUMN transfer_type ENUM('immediately','delivery')");
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
