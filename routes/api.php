<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EscrowController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/*
    Routes don't need authentication
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/escrow_subscribe', [EscrowController::class, 'escrow_subscribe']);
Route::get('/get_escrow_currencies', [EscrowController::class, 'get_escrow_currencies']);

/*
    Routes need authentication
*/
Route::group(['prefix' => 'user'], function () {  
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('addescrow', [EscrowController::class, 'addescrow']);
    Route::post('escrow_response', [EscrowController::class, 'escrow_response']);
    Route::post('transaction_list', [EscrowController::class, 'transaction_list']);
    Route::post('transaction_detail', [EscrowController::class, 'transaction_detail']);
    Route::post('escrow_update', [EscrowController::class, 'escrow_update']);
    Route::post('getuser', [AuthController::class, 'getuser']);
    Route::post('gift-update-status', [EscrowController::class, 'escrow_gift_change_status']);
});
