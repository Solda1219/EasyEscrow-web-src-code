<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public $apiMessage;
    public $apiData;
    public $apiValid;

    public function __construct()
    {
        $this->apiMessage = "";
        $this->apiData = [];
        $this->apiValid = false;
    }
}
