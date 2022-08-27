<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Response;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    public function __construct()
    {
        parent::__construct();
    }

    /**
    * Function register(Request $request)
    * Create a new user
    * @author Narinder Kumar <n88work@gmail.com>
    */
    public function register(Request $request){

        $validatedData = $request->validate([
            'username' => 'required',
            'public_key' => 'required',
            'permission' => 'required',
            'password' => 'required',
        ]);
        $user = User::create([
            'username' => $validatedData['username'],
            'password' => Hash::make($validatedData['password']),
            'public_key' => $validatedData['public_key'],
            'permission' => $validatedData['permission'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => "User registered successfully",
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    
    }

    /**
    * Function login(Request $request)
    * Create a function to login the  user
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function login(Request $request){

        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'password' => 'required',
        ]);

        $logged_in = false;
        if($validator->fails()){
            $this->apiData = $validator->errors();
            $this->apiMessage = $validator->errors()->first();
        } else {            
            $user = User::where([
                'username' => $request->username
            ])->first();  

            if ($user) {  
                if (Hash::check($request->password, $user->password)) {
                    $logged_in = true;
                }
                $this->apiMessage = "The password that you've entered is incorrect.";
                $data = ["password" => [$this->apiMessage]];
            } else {
                $this->apiMessage = "The username that you entered isn't connected to an account.";
                $this->apiData = ["username" => [$this->apiMessage]];
            }   
            
            
            
            if ($logged_in) {
                $datetime = Carbon::now()->toDateTimeString();
                $user->last_login = $datetime;
                $user->save();
                $token = $user->createToken('auth_token')->plainTextToken;
                $this->apiValid = TRUE;            
                $this->apiData = ['token' => $token,'user' => $user];  
                $this->apiMessage = "User logged in successfully";          
            } 
        }

        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]);      
    }

     /**
    * Function logout(Request $request)
    * Create a function to logout the  user
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function logout(Request $request){
        $this->apiMessage = "User Fails to Logout.";
        if(Auth::user()->currentAccessToken()->delete()){
            $this->apiValid = TRUE;   
            $this->apiMessage = "User Logout successfully.";  
        }       
        return response()->json([
            'valid' => $this->apiValid,
            'data' => $this->apiData,            
            'message' => $this->apiMessage,
        ]); 
    }

    /**
    * Function getuser()
    * Create a function to get login user
    * @author Narinder Kumar <n88work@gmail.com>
    */
    function getuser(){
        return auth()->user();
    }
}
