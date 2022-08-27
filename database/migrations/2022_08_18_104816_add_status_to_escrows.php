<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToEscrows extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('escrows', function (Blueprint $table) {
            DB::statement("ALTER TABLE escrows MODIFY COLUMN status ENUM('ready','cancelled','completed','confirmed') DEFAULT 'ready'");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('escrows', function (Blueprint $table) {
            //
        });
    }
}
