<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Escrow;
use App\Models\EscrowTransfer;
use App\Models\EscrowImages;
use App\Models\EscrowCurrencies;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Response;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Mail;
use Illuminate\Support\Facades\Log;

class EscrowController extends Controller
{

    public function __construct()
    {
        parent::__construct();
    }

    /**
    * Function addescrow(Request $request)
    * Create a function to insert crypto exchange entry
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function addescrow(Request $request){
        // get user information
        $message = "";
        $header = $request->header('Authorization');
        $header  = str_replace(' ', '', $header);
        $username  = str_replace('Bearer', '', $header);
        if(!empty($username)){
            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'escrow_id' => 'required_if:type_id,1,2,3,4,5',
                'amount' => 'required_if:type_id,1,2,3,4,5',
                'token' => 'required_if:type_id,1,2,3,4,5',
                'trade_username' => 'required_if:type_id,1,2,3,4',
                'trade_token' => 'required_if:type_id,1',
                'trade_amount' => 'required_if:type_id,1',
                'transfer_datetime' => 'required_if:type_id,2',
               // 'trade_time' => 'required_if:type_id,2',
                'title' => 'required_if:type_id,3,4,5',
                'description' => 'required_if:type_id,3,4,5',
                'transfer_type' => 'required_if:type_id,3,4',
                'pool_type' => 'required_if:type_id,5'
            ]);
            // check validator
            if($validator->fails()){
                $this->apiData = $validator->errors();
                $this->apiMessage = $validator->errors()->first();
            } else {
                $escrow = new Escrow;
                switch($request->type_id){
                    case 1:
                        $escrow->type_id = $request->type_id;
                        $escrow->username = $username;
                        $escrow->amount = $request->amount;
                        $escrow->token = $request->token;
                        $escrow->trade_username = $request->trade_username;
                        $escrow->trade_token = $request->trade_token;
                        $escrow->trade_amount = $request->trade_amount;
                        $escrow->escrow_contract_id = $request->escrow_id;
                        $message = "Crypto Exchange has been initiated";
                    break;
                    case 2:

                        // $date = strtotime($request->trade_date);
                        // $time = strtotime($request->trade_time);
                        // $date = date("y-m-d",$date);
                        // $time = date("H:i:s",$time);
                        // $time = strtotime($date." ".$time);
                       
                        $escrow->type_id = $request->type_id;
                        $escrow->username =  $username;
                        $escrow->amount = $request->amount;
                        $escrow->token = $request->token;
                        $escrow->trade_username = $request->trade_username;
                        $escrow->escrow_contract_id = $request->escrow_id;
                        $escrow->status = $request->escrow_status;
                        $escrow->transfer_datetime = date("y-m-d H:i:s",$request->transfer_datetime);
                        $message = "Crypto Gift has been initiated";
                        //echo "<pre>";print_r($escrow);die;
                    break;
                    case 3:
                    case 4:
                        $escrow->type_id = $request->type_id;
                        $escrow->username = $username;
                        $escrow->amount = $request->amount;
                        $escrow->token = $request->token;
                        $escrow->trade_username = $request->trade_username;
                        $escrow->title = $request->title;
                        $escrow->description = $request->description;
                        $escrow->transfer_type = $request->transfer_type;
                        $escrow->escrow_contract_id = $request->escrow_id;
                        $message = "Transaction has been saved successfully.";
                    break;
                    case 5:
                        $escrow->type_id = $request->type_id;
                        $escrow->username = $username;
                        $escrow->amount = $request->amount;
                        $escrow->token = $request->token;
                        $escrow->title = $request->title;
                        $escrow->description = $request->description;
                        $escrow->pool_type = $request->pool_type;
                        $escrow->escrow_contract_id = $request->escrow_id;
                        $message = "Transaction has been saved successfully.";
                    break;
                }
                
                if($escrow->save()){

                    // get last inserted id
                    $lastId = $escrow->id;

                    switch($request->type_id){
                        case 3:
                        case 4:
                            // upload images
                            if($request->has('image')) {
                                $this->upload_escrow_images($request,$lastId);
                            }
                        break;
                    }

                    // $escrowTransfer = array('escrow_id' => $lastId,'user_from' => $username,'user_to' => 'escrowwalletname',
                    // 'amount' => $request->amount,'token' => $request->token,'status' => 'completed','date' => Carbon::now()->toDateTimeString());
                    // // save record into escrow transfer
                    // $this->make_escrow_transfer($escrowTransfer);

                   

                    // $html = "<a href=\"http://easyescrow.io/escrow/".$lastId."\">Click on to verify transaction</a>";
                    // Mail::send([], [], function($message) use ($html) {
                    //     $message->to('alokjain.dev@gmail.com', 'Escrow Point')->subject
                    //         ('escrow notification email')->setBody($html, 'text/html');
                            
                    //     $message->from('ntest88work@gmail.com','form r444');
                    // });

                    $this->apiValid = TRUE;
                    $this->apiMessage = $message;
                }else{
                    $this->apiMessage = "Something went wrong. Please try again.";
                }
            }
        }else{
            $this->apiMessage = "Wallet name cannot be blank."; 
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);
        
    }

    /**
    * Function escrow_response(Request $request)
    * Create a function to get response from user when they will accept or cancel transactions
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function escrow_response(Request $request){
        // get user information
        $header = $request->header('Authorization');
        $header  = str_replace(' ', '', $header);
        $username  = str_replace('Bearer', '', $header);

        if(!empty($username)){
            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'escrow_id' => 'required',
                'status' => 'required',
            ]);
            // check validator
            if($validator->fails()){
                $this->apiData = $validator->errors();
                $this->apiMessage = $validator->errors()->first();
            } else {
                ///$username
                $escrow = Escrow::where('id', $request->escrow_id)->where('type_id', $request->type_id)->first();
                if($escrow){
                    $escrow->status = $request->status;
                    $escrow->status_change_at = Carbon::now()->toDateTimeString();
                    $escrow->updated_at = Carbon::now()->toDateTimeString();
                    if($escrow->save()){

                         // save record into escrow transfer
                        // $escrowTransfer = new EscrowTransfer;

                        // switch($request->type_id){
                        //     case 1:
                        //         $escrowTransfer->escrow_id = $request->escrow_id;
                        //         $escrowTransfer->user_id = $userInfo->id;
                              
                               

                        //         if($request->status == "cancelled"){
                        //             $escrowTransfer->user_from = "escrowwalletname";
                        //             $escrowTransfer->user_to = $escrow->username;
                        //             $escrowTransfer->amount = $escrow->amount;
                        //             $escrowTransfer->token = $escrow->token;
                        //         }else{
                        //             $escrowTransfer->user_from = $userInfo->username;
                        //             $escrowTransfer->user_to = $escrow->username;
                        //             $escrowTransfer->amount = $escrow->trade_amount;
                        //             $escrowTransfer->token = $escrow->trade_token;
                        //         }

                        //         $escrowTransfer->status = ($request->status == "completed" ? "completed" : "cancelled");
                        //         $escrowTransfer->date = Carbon::now()->toDateTimeString();
                        //     break;
                        //     case 2:
                        //         $escrowTransfer->escrow_id = $request->escrow_id;
                        //         $escrowTransfer->user_id = $userInfo->id;
                                
                        //         if($request->status == "cancelled"){
                        //             $escrowTransfer->user_from = "escrowwalletname";
                        //             $escrowTransfer->user_to = $escrow->username;
                        //         }else{
                        //             $escrowTransfer->user_from = "escrowwalletname";
                        //             $escrowTransfer->user_to = $escrow->username;
                        //         }
                        //         $escrowTransfer->amount = $escrow->trade_amount;
                        //         $escrowTransfer->token = $escrow->trade_token;
                        //         $escrowTransfer->status = ($request->status == "completed" ? "completed" : "cancelled");
                        //         $escrowTransfer->date = Carbon::now()->toDateTimeString();
                        //     break;
                        // }

                        // $escrowTransfer->save();
        
                        $this->apiValid = TRUE;
                        $this->apiMessage = "Transaction has been updated successfully.";
                    }else{
                        $this->apiMessage = "Something went wrong. Please try again.";
                    }
                }else{
                    $this->apiMessage = "No matching record found.";
                }
            
            }
        }else{
            $this->apiMessage = "Wallet name cannot be blank."; 
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);
        
    }
     /**
    * Function transaction_list(Request $request)
    * Create a function to list contract transactions
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function transaction_list(Request $request){
        // get user information

        $header = $request->header('Authorization');
        $header  = str_replace(' ', '', $header);
        $username  = str_replace('Bearer', '', $header);
        
        if($username){
            $validator = Validator::make($request->all(), [
                'trans_type' => 'required',
                'trans_status' => 'required'
            ]);
            // check validator
            if($validator->fails()){
                $this->apiData = $validator->errors();
                $this->apiMessage = $validator->errors()->first();
            } else {
                $status = $request->trans_status;
                if($status == "pending"){
                    $status = "ready";
                }
                $escrowList = Escrow::where('id','!=','0');
                if($request->trans_type != 'all'){
                    $escrowList->where(function($query) use ($username,$request) {
                        $query->where('type_id', $request->trans_type);
                    });
                }
                if($status != 'any'){
                    $escrowList->where(function($query) use ($username,$request,$status) {
                        $query->where('status', $status);
                    });
                }
                $escrowList->where(function($query) use ($username,$request) {
                    $query->where(function($query) use ($username) {
                        $query->where('username', $username)
                        ->Where('type_id', '!=', '5')
                        ->where('parent_id', NULL);
                    });
                    $query->orwhere(function($query) use ($username,$request) {
                        $query->where('username', $username)
                        ->Where('type_id', '5');
                    });
                    $query->orwhere(function($query) use ($username,$request) {
                        $query->where('trade_username', $username)
                        ->Where('type_id', '2')
                        ->Where('status', 'completed');
                    });
                    $query->orwhere(function($query) use ($username,$request) {
                        $query->where('trade_username', $username)
                        ->Where('type_id', '!=', '2');
                    });
                });
                
                $listTransaction = $escrowList->with('parent')->get();

                if(!empty($listTransaction)){
                    $this->apiValid = true;
                    $this->apiData = $listTransaction;
                }else{
                    $this->apiMessage = "No matching record found.";
                }
            }
        }else{
            $this->apiMessage = "Wallet name cannot be blank.";
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);
        
    }
     /**
    * Function transaction_list(Request $request)
    * Create a function to list contract transactions
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function transaction_detail(Request $request){
        
        // get user information
        $header = $request->header('Authorization');
        $header  = str_replace(' ', '', $header);
        $username  = str_replace('Bearer', '', $header);
        
        if(!empty($username)){
            $validator = Validator::make($request->all(), [
                'id' => 'required',
            ]);
            // check validator
            if($validator->fails()){
                $this->apiData = $validator->errors();
                $this->apiMessage = $validator->errors()->first();
            } else {

                $escrowFirst = Escrow::where('id','=',$request->id)->with(['negotiations','images'])->first();

                if(!empty($escrowFirst)){
                    if($escrowFirst->type_id == 5){
                        $winnerQuery = Escrow::where('parent_id', $escrowFirst->id)->where('pool_outcome', $escrowFirst->pool_outcome);                                        
                        $winners = $winnerQuery->orderBy('id', 'DESC')->get();
                        $escrowFirst->setAttribute('winners', $winners);
                    }
                     $this->apiValid = true;
                     $this->apiData = $escrowFirst;
                }else{
                     $this->apiMessage = "No matching record found.";
                }

            }
        }else{
            $this->apiMessage = "Wallet name cannot be blank.";  
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);
        
    }

    /**
    * Function escrow_update(Request $request)
    * Create a function to negotiate purchase service
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function escrow_update(Request $request){
       
        // get user information
        $header = $request->header('Authorization');
        $header  = str_replace(' ', '', $header);
        $username  = str_replace('Bearer', '', $header);
        if(!empty($username)){
            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'action' => 'required',
                'escrow_id' => 'required'
            ]);
            if(!$validator->fails()){
                switch($request->action){
                    case "negotiate":
                        $validator = Validator::make($request->all(), [
                            'amount' => 'required_if:type_id,3,4',
                            'token' => 'required_if:type_id,3,4',
                            'description' => 'required_if:type_id,3,4',
                            'transfer_type' => 'required_if:type_id,3,4',
                        ]);
                    break;
                    case "pool_update":
                        $validator = Validator::make($request->all(), [
                            'pool_outcome' => 'required_if:type_id,5',
                        ]);
                    break;
                    case "pool_complete":
                        $validator = Validator::make($request->all(), [
                            'pool_outcome' => 'required_if:type_id,5',
                        ]);
                    break;
                }
                
                // check validator
                if($validator->fails()){
                    $this->apiData = $validator->errors();
                    $this->apiMessage = $validator->errors()->first();
                } else {
                    $escrowFirst = Escrow::find($request->escrow_id);
                    if($escrowFirst){
                        switch($request->type_id){
                            case 3:
                            case 4:
                                switch($request->action){
                                    case "negotiate":
                                        $escrow = new Escrow;
                                        $escrow->type_id = $request->type_id;
                                        $escrow->username = $username;
                                        $escrow->amount = $request->amount;
                                        $escrow->token = $request->token;
                                        $escrow->description = $request->description;
                                        $escrow->transfer_type = $request->transfer_type;
                                        $escrow->parent_id = $escrowFirst->id;
                                        if($escrow->save()){
                                            // get last inserted id
                                            $lastId = $request->escrow_id;
                    
                                            switch($request->type_id){
                                                // upload images
                                                case 3:
                                                case 4:
                                                    if($request->has('image')) {
                                                        $this->upload_escrow_images($request,$request->escrow_id);
                                                    }
                                                break;
                                            }
                                            // if($userInfo->username == $escrowFirst->username){

                                            //     // check last entry
                                            //     $escrowList = Escrow::where('username','=',$userInfo->username)->where('id','!=', $lastId);
                                            //     // get last negotiate
                                            //     $escrowList->where(function($query) use ($userInfo,$request) {
                                            //     $query->where('parent_id', $request->escrow_id)
                                            //     ->orWhere('id', $request->escrow_id);
                                            //     });

                                            //     $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                            //     if(!empty($lastNegotiate)){
                                            //         // make transfer entry
                                            //         $escrowTransfer = array(
                                            //             'escrow_id' => $escrowFirst->id,
                                            //             'user_id' => $userInfo->id,
                                            //             'user_from' =>'escrowwalletname',
                                            //             'user_to' => $userInfo->username,
                                            //             'amount' => $lastNegotiate->amount,
                                            //             'token' => $lastNegotiate->token,
                                            //             'status' => 'completed',
                                            //             'date' => Carbon::now()->toDateTimeString()
                                            //         );
                                            //         $this->make_escrow_transfer($escrowTransfer);
                                            //     }
                                            //     // make transfer entry
                                            //     $escrowTransfer = array(
                                            //         'escrow_id' => $escrowFirst->id,
                                            //         'user_id' => $userInfo->id,
                                            //         'user_from' => $userInfo->username,
                                            //         'user_to' => 'escrowwalletname',
                                            //         'amount' => $request->amount,
                                            //         'token' => $request->token,
                                            //         'status' => 'completed',
                                            //         'date' => Carbon::now()->toDateTimeString()
                                            //     );
                                            //     $this->make_escrow_transfer($escrowTransfer);
                                            // }

                                            $this->apiValid = TRUE;
                                            $this->apiMessage = "Transaction has been updated successfully.";
                                        }else{
                                            $this->apiMessage = "Something went wrong. Please try again.";
                                        }
                                    break;
                                    case "agree":

                                        $escrowFirst->status = 'escrow_awaited';
                                        $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                        $escrowFirst->save();
                                        // check last entry
                                        $escrowList = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id);                                        
                                        $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                        
                                        if(!empty($lastNegotiate)){
                                            $lastNegotiate->status = 'escrow_awaited';
                                            $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                            $lastNegotiate->save();
                                            if($username == $escrowFirst->trade_username){
                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //         // make transfer entry
                                                //         $escrowTransfer = array(
                                                //             'escrow_id' => $escrowFirst->id,
                                                //             'user_id' => $userInfo->id,
                                                //             'user_from' => 'escrowwalletname',
                                                //             'user_to' => $escrowFirst->trade_username,
                                                //             'amount' => $lastNegotiate->amount,
                                                //             'token' => $lastNegotiate->token,
                                                //             'status' => 'completed',
                                                //             'date' => Carbon::now()->toDateTimeString()
                                                //         );
                                                //         $this->make_escrow_transfer($escrowTransfer);
                                                // } 
                                            }else{
                                                 // check last entry
                                                //  $escrowSql = Escrow::where('username','=',$userInfo->username)->where('id','!=', $lastNegotiate->id);
                                                //  // get last negotiate
                                                //  $escrowSql->where(function($query) use ($userInfo,$request) {
                                                //  $query->where('parent_id', $request->escrow_id)
                                                //  ->orWhere('id', $request->escrow_id);
                                                //  });
                                                //  $lastBuyerNegotiate = $escrowSql->orderBy('id', 'DESC')->first();
                                                //  if(!empty($lastBuyerNegotiate)){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $userInfo->username,
                                                //         'amount' => $lastBuyerNegotiate->amount,
                                                //         'token' => $lastBuyerNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }
                                                // make transfer entry
                                                // $escrowTransfer = array(
                                                //     'escrow_id' => $escrowFirst->id,
                                                //     'user_id' => $userInfo->id,
                                                //     'user_from' => $userInfo->username,
                                                //     'user_to' => 'escrowwalletname',
                                                //     'amount' => $lastNegotiate->amount,
                                                //     'token' => $lastNegotiate->token,
                                                //     'status' => 'completed',
                                                //     'date' => Carbon::now()->toDateTimeString()
                                                // );
                                                // $this->make_escrow_transfer($escrowTransfer);

                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $escrowFirst->trade_username,
                                                //         'amount' => $lastNegotiate->amount,
                                                //         'token' => $lastNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }       
                                            } 
                                        }
                                        $this->apiValid = TRUE;
                                        $this->apiMessage = "Transaction has been updated successfully.";
                                        
                                    break;
                                    case "fund_transfer_escrow":

                                        $escrowFirst->status = 'confirmed';
                                        $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                        $escrowFirst->save();
                                        // check last entry
                                        $escrowList = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id);                                        
                                        $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                        
                                        if(!empty($lastNegotiate)){
                                            $lastNegotiate->status = 'confirmed';
                                            $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                            $lastNegotiate->save();
                                            if($username == $escrowFirst->trade_username){
                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //         // make transfer entry
                                                //         $escrowTransfer = array(
                                                //             'escrow_id' => $escrowFirst->id,
                                                //             'user_id' => $userInfo->id,
                                                //             'user_from' => 'escrowwalletname',
                                                //             'user_to' => $escrowFirst->trade_username,
                                                //             'amount' => $lastNegotiate->amount,
                                                //             'token' => $lastNegotiate->token,
                                                //             'status' => 'completed',
                                                //             'date' => Carbon::now()->toDateTimeString()
                                                //         );
                                                //         $this->make_escrow_transfer($escrowTransfer);
                                                // } 
                                            }else{
                                                 // check last entry
                                                //  $escrowSql = Escrow::where('username','=',$userInfo->username)->where('id','!=', $lastNegotiate->id);
                                                //  // get last negotiate
                                                //  $escrowSql->where(function($query) use ($userInfo,$request) {
                                                //  $query->where('parent_id', $request->escrow_id)
                                                //  ->orWhere('id', $request->escrow_id);
                                                //  });
                                                //  $lastBuyerNegotiate = $escrowSql->orderBy('id', 'DESC')->first();
                                                //  if(!empty($lastBuyerNegotiate)){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $userInfo->username,
                                                //         'amount' => $lastBuyerNegotiate->amount,
                                                //         'token' => $lastBuyerNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }
                                                // make transfer entry
                                                // $escrowTransfer = array(
                                                //     'escrow_id' => $escrowFirst->id,
                                                //     'user_id' => $userInfo->id,
                                                //     'user_from' => $userInfo->username,
                                                //     'user_to' => 'escrowwalletname',
                                                //     'amount' => $lastNegotiate->amount,
                                                //     'token' => $lastNegotiate->token,
                                                //     'status' => 'completed',
                                                //     'date' => Carbon::now()->toDateTimeString()
                                                // );
                                                // $this->make_escrow_transfer($escrowTransfer);

                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $escrowFirst->trade_username,
                                                //         'amount' => $lastNegotiate->amount,
                                                //         'token' => $lastNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }       
                                            } 
                                        }
                                        $this->apiValid = TRUE;
                                        $this->apiMessage = "Transaction has been updated successfully.";
                                        
                                    break;
                                    case "delivered":
                                        $escrowFirst->status = 'delivered';
                                        $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                        $escrowFirst->save();
                                         // check last entry
                                         $escrowList = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id);                                        
                                         $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                        if(!empty($lastNegotiate)){
                                            $lastNegotiate->status = 'delivered';
                                            $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                            $lastNegotiate->save();
                                            if($username == $escrowFirst->trade_username){
                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //         // make transfer entry
                                                //         $escrowTransfer = array(
                                                //             'escrow_id' => $escrowFirst->id,
                                                //             'user_id' => $userInfo->id,
                                                //             'user_from' => 'escrowwalletname',
                                                //             'user_to' => $escrowFirst->trade_username,
                                                //             'amount' => $lastNegotiate->amount,
                                                //             'token' => $lastNegotiate->token,
                                                //             'status' => 'completed',
                                                //             'date' => Carbon::now()->toDateTimeString()
                                                //         );
                                                //         $this->make_escrow_transfer($escrowTransfer);
                                                // } 
                                            }else{
                                                 // check last entry
                                                //  $escrowSql = Escrow::where('username','=',$userInfo->username)->where('id','!=', $lastNegotiate->id);
                                                //  // get last negotiate
                                                //  $escrowSql->where(function($query) use ($userInfo,$request) {
                                                //  $query->where('parent_id', $request->escrow_id)
                                                //  ->orWhere('id', $request->escrow_id);
                                                //  });
                                                //  $lastBuyerNegotiate = $escrowSql->orderBy('id', 'DESC')->first();
                                                //  if(!empty($lastBuyerNegotiate)){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $userInfo->username,
                                                //         'amount' => $lastBuyerNegotiate->amount,
                                                //         'token' => $lastBuyerNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }
                                                // make transfer entry
                                                // $escrowTransfer = array(
                                                //     'escrow_id' => $escrowFirst->id,
                                                //     'user_id' => $userInfo->id,
                                                //     'user_from' => $userInfo->username,
                                                //     'user_to' => 'escrowwalletname',
                                                //     'amount' => $lastNegotiate->amount,
                                                //     'token' => $lastNegotiate->token,
                                                //     'status' => 'completed',
                                                //     'date' => Carbon::now()->toDateTimeString()
                                                // );
                                                // $this->make_escrow_transfer($escrowTransfer);

                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $escrowFirst->trade_username,
                                                //         'amount' => $lastNegotiate->amount,
                                                //         'token' => $lastNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }       
                                            } 
                                        }
                                    //     $amount = $escrowFirst->amount;
                                    //     $token = $escrowFirst->token;
                                    //     $transfer_type = $escrowFirst->transfer_type;
                                    //    // check last entry
                                    //    $escrowList = Escrow::where('parent_id', $request->escrow_id);                                        
                                    //    $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                    //    if(!empty($lastNegotiate)){
                                    //        $lastNegotiate->status = 'completed';
                                    //        $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                    //        $lastNegotiate->save();
                                    //        $amount = $lastNegotiate->amount;
                                    //        $token = $lastNegotiate->token;
                                    //        $transfer_type = $lastNegotiate->transfer_type;
                                    //    }
                                    //    if($transfer_type == 'delivery'){
                                    //         $escrowTransfer = array(
                                    //             'escrow_id' => $escrowFirst->id,
                                    //             'user_id' => $userInfo->id,
                                    //             'user_from' => 'escrowwalletname',
                                    //             'user_to' => $escrowFirst->trade_username,
                                    //             'amount' => $amount,
                                    //             'token' => $token,
                                    //             'status' => 'completed',
                                    //             'date' => Carbon::now()->toDateTimeString()
                                    //         );
                                    //         $this->make_escrow_transfer($escrowTransfer);
                                    //     }  
                                       $this->apiValid = TRUE;
                                       $this->apiMessage = "Transaction has been updated successfully.";
                                       break;
                                       case "received_item":
                                        $escrowFirst->status = 'completed';
                                        $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                        $escrowFirst->save();
                                         // check last entry
                                         $escrowList = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id);                                        
                                         $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                        if(!empty($lastNegotiate)){
                                            $lastNegotiate->status = 'completed';
                                            $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                            $lastNegotiate->save();
                                            if($username == $escrowFirst->trade_username){
                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //         // make transfer entry
                                                //         $escrowTransfer = array(
                                                //             'escrow_id' => $escrowFirst->id,
                                                //             'user_id' => $userInfo->id,
                                                //             'user_from' => 'escrowwalletname',
                                                //             'user_to' => $escrowFirst->trade_username,
                                                //             'amount' => $lastNegotiate->amount,
                                                //             'token' => $lastNegotiate->token,
                                                //             'status' => 'completed',
                                                //             'date' => Carbon::now()->toDateTimeString()
                                                //         );
                                                //         $this->make_escrow_transfer($escrowTransfer);
                                                // } 
                                            }else{
                                                 // check last entry
                                                //  $escrowSql = Escrow::where('username','=',$userInfo->username)->where('id','!=', $lastNegotiate->id);
                                                //  // get last negotiate
                                                //  $escrowSql->where(function($query) use ($userInfo,$request) {
                                                //  $query->where('parent_id', $request->escrow_id)
                                                //  ->orWhere('id', $request->escrow_id);
                                                //  });
                                                //  $lastBuyerNegotiate = $escrowSql->orderBy('id', 'DESC')->first();
                                                //  if(!empty($lastBuyerNegotiate)){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $userInfo->username,
                                                //         'amount' => $lastBuyerNegotiate->amount,
                                                //         'token' => $lastBuyerNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }
                                                // make transfer entry
                                                // $escrowTransfer = array(
                                                //     'escrow_id' => $escrowFirst->id,
                                                //     'user_id' => $userInfo->id,
                                                //     'user_from' => $userInfo->username,
                                                //     'user_to' => 'escrowwalletname',
                                                //     'amount' => $lastNegotiate->amount,
                                                //     'token' => $lastNegotiate->token,
                                                //     'status' => 'completed',
                                                //     'date' => Carbon::now()->toDateTimeString()
                                                // );
                                                // $this->make_escrow_transfer($escrowTransfer);

                                                // if($lastNegotiate->transfer_type == 'immediately'){
                                                //     // make transfer entry
                                                //     $escrowTransfer = array(
                                                //         'escrow_id' => $escrowFirst->id,
                                                //         'user_id' => $userInfo->id,
                                                //         'user_from' => 'escrowwalletname',
                                                //         'user_to' => $escrowFirst->trade_username,
                                                //         'amount' => $lastNegotiate->amount,
                                                //         'token' => $lastNegotiate->token,
                                                //         'status' => 'completed',
                                                //         'date' => Carbon::now()->toDateTimeString()
                                                //     );
                                                //     $this->make_escrow_transfer($escrowTransfer);
                                                // }       
                                            } 
                                        }
                                    //     $amount = $escrowFirst->amount;
                                    //     $token = $escrowFirst->token;
                                    //     $transfer_type = $escrowFirst->transfer_type;
                                    //    // check last entry
                                    //    $escrowList = Escrow::where('parent_id', $request->escrow_id);                                        
                                    //    $lastNegotiate = $escrowList->orderBy('id', 'DESC')->first();
                                    //    if(!empty($lastNegotiate)){
                                    //        $lastNegotiate->status = 'completed';
                                    //        $lastNegotiate->status_change_at = Carbon::now()->toDateTimeString();
                                    //        $lastNegotiate->save();
                                    //        $amount = $lastNegotiate->amount;
                                    //        $token = $lastNegotiate->token;
                                    //        $transfer_type = $lastNegotiate->transfer_type;
                                    //    }
                                    //    if($transfer_type == 'delivery'){
                                    //         $escrowTransfer = array(
                                    //             'escrow_id' => $escrowFirst->id,
                                    //             'user_id' => $userInfo->id,
                                    //             'user_from' => 'escrowwalletname',
                                    //             'user_to' => $escrowFirst->trade_username,
                                    //             'amount' => $amount,
                                    //             'token' => $token,
                                    //             'status' => 'completed',
                                    //             'date' => Carbon::now()->toDateTimeString()
                                    //         );
                                    //         $this->make_escrow_transfer($escrowTransfer);
                                    //     }  
                                       $this->apiValid = TRUE;
                                       $this->apiMessage = "Transaction has been updated successfully.";
                                       break;
                                    }
                                break;
                                case 5:
                                    switch($request->action){
                                        case "pool_update":
                                        $escrow = new Escrow;
                                        $escrow->type_id = $request->type_id;
                                        $escrow->amount = $escrowFirst->amount;
                                        $escrow->token = $escrowFirst->token;
                                        $escrow->username = $username;
                                        $escrow->pool_outcome = $request->pool_outcome;
                                        $escrow->parent_id = $escrowFirst->id;
                                        if($escrow->save()){
                                            // get last inserted id
                                            // $escrowTransfer = array('escrow_id' => $request->escrow_id,'user_id' => $userInfo->id,
                                            // 'user_from' => $userInfo->username,'user_to' => 'escrowwalletname',
                                            // 'amount' => $escrowFirst->amount,'token' => $escrowFirst->token,'status' => 'completed',
                                            // 'date' => Carbon::now()->toDateTimeString());
                                            //     // save record into escrow transfer
                                            // $this->make_escrow_transfer($escrowTransfer);
                                            $this->apiValid = TRUE;
                                            $this->apiMessage = "Pool has been updated successfully.";
                                        }else{
                                            $this->apiMessage = "Something went wrong. Please try again.";
                                        }
                                        break;
                                        case "pool_complete":
                                        
                                        
                                        $totalAmouont = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id)->sum('amount');
                                         // check last entry
                                         $escrowList = Escrow::where('parent_id', $request->escrow_id)->where('pool_outcome', $request->pool_outcome);                                        
                                         $winners = $escrowList->orderBy('id', 'DESC')->get();
                                         $totalWinners = count($winners);
                                        //  if(!empty($totalWinners)){
                                        //     //  $divideAmount = $totalAmouont/$totalWinners;
                                        //     //  foreach($winners as $winners){
                                        //     //     $escrowTransfer = array('escrow_id' => $request->escrow_id,'user_id' => $userInfo->id,
                                        //     //     'user_from' => 'escrowwalletname','user_to' => $winners->username,
                                        //     //     'amount' => $divideAmount,'token' => $escrowFirst->token,'status' => 'completed',
                                        //     //     'date' => Carbon::now()->toDateTimeString());
                                        //     //     // save record into escrow transfer
                                        //     //     $this->make_escrow_transfer($escrowTransfer);
                                        //     //  }
                                        //  }else{
                                        //     $escrowTransfer = array('escrow_id' => $request->escrow_id,'user_id' => $userInfo->id,
                                        //     'user_from' => 'escrowwalletname','user_to' => $userInfo->username,
                                        //     'amount' => $totalAmouont,'token' => $escrowFirst->token,'status' => 'completed',
                                        //     'date' => Carbon::now()->toDateTimeString());
                                        //     // save record into escrow transfer
                                        //     $this->make_escrow_transfer($escrowTransfer);
                                        //  }
    
                                         $escrowFirst->status = 'completed';
                                         $escrowFirst->pool_outcome = $request->pool_outcome;
                                         $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                         $escrowFirst->save();
    
                                        if($escrowFirst->save()){
                                            $this->apiValid = TRUE;
                                            $this->apiMessage = "Pool has been completed successfully.";
                                        }else{
                                            $this->apiMessage = "Something went wrong. Please try again.";
                                        }
                                        break;
                                        case "pool_cancel":
                                        
                                        $poolUsers = Escrow::where('parent_id', $request->escrow_id)->orWhere('id', $request->escrow_id)->get();
                                        if(count($poolUsers) > 1){
                                            // foreach($poolUsers as $user){
                                            //     $escrowTransfer = array('escrow_id' => $request->escrow_id,'user_id' => $userInfo->id,
                                            //     'user_from' => 'escrowwalletname','user_to' => $user->username,
                                            //     'amount' => $user->amount,'token' => $escrowFirst->token,'status' => 'completed',
                                            //     'date' => Carbon::now()->toDateTimeString());
                                            //     // save record into escrow transfer
                                            //     $this->make_escrow_transfer($escrowTransfer);
                                            // }
        
                                            $escrowFirst->status = 'cancelled';
                                            $escrowFirst->status_change_at = Carbon::now()->toDateTimeString();
                                            $escrowFirst->save();
        
                                           if($escrowFirst->save()){
                                               $this->apiValid = TRUE;
                                               $this->apiMessage = "Pool has been cancelled successfully.";
                                           }else{
                                               $this->apiMessage = "Something went wrong. Please try again.";
                                           }
                                        }else{
                                            $this->apiMessage = "No users found for pool.";
                                        }
                                        
                                     break;
                                }
                            break;
                        }
                    }else{
                        $this->apiMessage = "No matched record found.";
                    }
                }
            }else{
                $this->apiData = $validator->errors();
                $this->apiMessage = $validator->errors()->first();
            }
        }else{
            $this->apiMessage = "Wallet name cannot be blank.";
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]); 
    }

    /**
    * Function upload_escrow_images($request,$lastId)
    * Create a function to upload escrow images
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function upload_escrow_images($request,$lastId){

        foreach($request->file('image') as $image) {
            $imageName = rand().'_'.str_replace(" ","_",$image->getClientOriginalName());  
            $image->move('uploads/escrow_'.$lastId.'/', $imageName);

            EscrowImages::create([
                'filename' => $imageName,
                'escrow_id' => $lastId,
            ]);
        }
    }

    /**
    * Function make_escrow_transfer($escrowId,$user_from,$user_to,$amount,$token)
    * Create a function to make new entry for escrow transfer
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function make_escrow_transfer($data){
        // get user information
        EscrowTransfer::create($data);
    }

     /**
    * Function escrow_subscribe($request)
    * Create a function to add contact to sendgrid account
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function escrow_subscribe(Request $request){
       
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',               
        ]);
        // check validator
        if($validator->fails()){
            $this->apiData = $validator->errors();
            $this->apiMessage = $validator->errors()->first();
        } else {
            $sendgridKey = env('SENDGRID_KEY');
            $sendgridlistId = env('SENDGRID_CONTACT_LISTID');
            
            $email = $request->email;
            $sg = new \SendGrid($sendgridKey);
            $body = '{
                "list_ids": ["'.$sendgridlistId.'"],
                "contacts": [
                    {
                        "email":"'.$email.'"
                    }
                ]
            }';

            $request_body = json_decode($body);
           
            try {
                $response = $sg->client->marketing()->contacts()->put($request_body);
            } catch (Exception $ex) {
                $response = $ex->getMessage();
            }
            $decodeResp = json_decode($response->body());
            
            if(!empty($decodeResp->job_id)){
                $this->apiValid = true;
                $this->apiMessage = "You have been subscribed successfully.";
            }else{
                $this->apiMessage = "Something went wrong. Please try again.";
            }
        }
        // return response
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);
    }

    /**
    * Function get_escrow_currencies(Request $request)
    * Create a function to list currencies
    * @author Narinder Kumar <n88work@gmail.com>
    */
    public function get_escrow_currencies(Request $request){
        
        // get currencies list information
        $list = EscrowCurrencies::get();
        if(!empty($list)){
            $currencies = [];
            foreach($list as $key => $curr){
                $currencies[$key]['currency'] = $curr['currency'];
                $currencies[$key]['contract'] = $curr['cur_contract'];
                $currencies[$key]['decimals'] = $curr['cur_decimals'];
            }
            $this->apiData = $currencies;
            $this->apiValid = true;
            $this->apiMessage = "Data returned successfully.";
        }else{
            $this->apiMessage = "No currencies found.";
        }
        // return response
        return response()->json([
           'valid' => $this->apiValid,
           'data' => $this->apiData,            
           'message' => $this->apiMessage,
        ]
       );
    }

     /**
    * Function escrow_gift_change_status(Request $request)
    * Update crypto gift status
    * @author Narinder Kumar <n88work@gmail.com>
    */
    public function escrow_gift_change_status(Request $request){

        $data = json_decode($request->getContent(),true);
        if(!empty($data)){
            $escrow = Escrow::where('escrow_contract_id', $data['escrow_id'])->where('type_id', $data['type_id'])->first();
            if($escrow){
                $escrow->status = 'completed';
                $escrow->status_change_at = Carbon::now()->toDateTimeString();
                $escrow->updated_at = Carbon::now()->toDateTimeString();
                if($escrow->save()){
                    $message = "Status updated successfully.";
                }else{
                    $message = "Something went wrong while updating.";
                }
            }else{
                $message = "No escrow data found.";
            }
        }else{
            $message = "invalid request.";
        }
        $respArray = array("response" => $message);
        echo json_encode($respArray);die;
    }
}
