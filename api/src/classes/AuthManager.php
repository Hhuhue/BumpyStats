<?php

namespace Classes;

require '../../vendor/autoload.php';

use Carbon\Carbon;

class AuthManager{

    private $dotenv;
    private $storage;
    private $secret;
    private $access_pwd;

    public function __construct($secret, $access_pwd)
    {
        $this->secret = $secret;
        $this->access_pwd = $access_pwd;

    }

    public function VerifyUser($password){
        $providedPassword = hash_hmac('sha256', $password, $this->secret, true);
        $storedPassword = hash_hmac('sha256', $this->access_pwd, $this->secret, true);

        if($providedPassword == $storedPassword){
            return $this->GenerateJWT();
        } else {
            return -1;
        }
    }

    public function GenerateJWT(){
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]);
        
        $payload = json_encode([
            'user_id' => 1,
            'role' => 'admin',
            'exp' => time() + 3600
        ]);
        
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);
        $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
        return $jwt;
    }

    public function ValidateJWT($jwt){
        // split the token
        $tokenParts = explode('.', $jwt);
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        // check the expiration time - note this will cause an error if there is no 'exp' claim in the token
        $expiration = Carbon::createFromTimestamp(json_decode($payload)->exp);
        $tokenExpired = (Carbon::now()->diffInSeconds($expiration, false) < 0);

        // build a signature based on the header and payload using the secret
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        // verify it matches the signature provided in the token
        $signatureValid = ($base64UrlSignature === $signatureProvided);

        echo "Header:\n" . $header . "\n";
        echo "Payload:\n" . $payload . "\n";

        if ($tokenExpired) {
            echo "Token has expired.\n";
        } else {
            echo "Token has not expired yet.\n";
        }

        if ($signatureValid) {
            echo "The signature is valid.\n";
        } else {
            echo "The signature is NOT valid\n";
        }
    }

    private function base64UrlEncode($text)
    {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }
}