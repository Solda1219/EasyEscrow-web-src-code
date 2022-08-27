<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EscrowCurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $currencyArr = array(
            [
                "currency"=> "XPR",
                "contract"=> "eosio.token",
                "decimals"=> "4",
            ],
            [
                "decimals"=> "4",
                "contract"=> "loan.token",
                "currency"=> "LOAN",
            ],
            [
                "currency"=> "FOOBAR",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "decimals"=> "4",
                "contract"=> "storex",
                "currency"=> "STRX",
            ],
            [
                "currency"=> "BTCL",
                "contract"=> "wrapper",
                "decimals"=> "8",
            ]
            ,
            [
                "currency"=> "XADA",
                "decimals"=> "6",
                "contract"=> "xtokens",
            ],
            [
                "currency"=> "XBCH",
                "contract"=> "xtokens",
                "decimals"=> "8",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "8",
                "currency"=> "XBNB",
            ],
            [
                "currency"=> "XBTC",
                "contract"=> "xtokens",
                "decimals"=> "8",
            ],
            [
                "currency"=> "XBUSD",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "currency"=> "XDOGE",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "8",
                "currency"=> "XDOT",
            ],
            [
                "decimals"=> "4",
                "contract"=> "xtokens",
                "currency"=> "XEOS",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "8",
                "currency"=> "XETH",
            ],
            [
                "currency"=> "XLTC",
                "contract"=> "xtokens",
                "decimals"=> "8",
            ],
            [
                "decimals"=> "6",
                "contract"=> "xtokens",
                "currency"=> "XLUNA",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "6",
                "currency"=> "XMDA",
            ],
            [
                "currency"=> "XMT",
                "decimals"=> "8",
                "contract"=> "xtokens",
            ],
            [
                "currency"=> "XPAX",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "currency"=> "XPAXG",
                "contract"=> "xtokens",
                "decimals"=> "8",
            ],
            [
                "currency"=> "XSOL",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "currency"=> "XTUSD",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "6",
                "currency"=> "XUNI",
            ],
            [
                "currency"=> "XUSDC",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "6",
                "currency"=> "XUSDT",
            ],
            [
                "contract"=> "xtokens",
                "decimals"=> "6",
                "currency"=> "XUST",
            ],
            [
                "currency"=> "XXRP",
                "contract"=> "xtokens",
                "decimals"=> "6",
            ]
        );

        foreach($currencyArr as $currency){
            DB::table('escrow_currencies')->insert([
                [    
                    'currency' => $currency['currency'],
                    'cur_contract' => $currency['contract'],
                    'cur_decimals' => $currency['decimals'],
                    'cur_title' => $currency['contract'],
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
        
                ],
            ]);
        }
    }
}
