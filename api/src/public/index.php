<?php
header("Access-Control-Allow-Origin: *");
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../../vendor/autoload.php';
require_once('../classes/Database.php');

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;

$config['db']['host']   = 'localhost';
$config['db']['user']   = 'dev';
$config['db']['pass']   = 'Welcome!123';
$config['db']['dbname'] = 'bumpystatsdb';

$app = new \Slim\App(['settings' => $config]);

$container = $app->getContainer();

$container['logger'] = function($c) {
    $logger = new \Monolog\Logger('my_logger');
    $file_handler = new \Monolog\Handler\StreamHandler('../logs/app.log');
    $logger->pushHandler($file_handler);
    return $logger;
};

$container['db'] = function ($c) {
    $db = $c['settings']['db'];
    $pdo = new PDO('mysql:host=' . $db['host'] . ';dbname=' . $db['dbname'],
    $db['user'], $db['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};

$app->get('/snapshot', function (Request $request, Response $response) {
    $client = new GuzzleHttp\Client();
    $request = new \GuzzleHttp\Psr7\Request('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');
    $result = $client->send($request)->getBody();
    $date = date('Y-m-d');

    $connection = new Database($this->db, $this->logger);
    $players = $connection->snapshot($result, $date);    

    foreach ($players as $player) {
        $playerRequest = new \GuzzleHttp\Psr7\Request('GET', 'http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=' . $player['guid']);
        $playerResult = $client->send($playerRequest)->getBody();
        $progress = $connection->setOffBoardPlayerProgress($player['id'], $playerResult, $date);
    }

    return $response;
});

$app->get('/snapshot-preview', function (Request $request, Response $response) {

    $client = new GuzzleHttp\Client();
    $request = new \GuzzleHttp\Psr7\Request('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');
    $result = $client->send($request)->getBody();
    $date = date('Y-m-d');

    $connection = new Database($this->db, $this->logger);
    $preview = $connection->snapshotPreview($result, $date);
    $json = $preview['result'];

    foreach ($preview['players'] as $player) {
        $playerRequest = new \GuzzleHttp\Psr7\Request('GET', 'http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=' . $player['guid']);
        $playerResult = $client->send($playerRequest)->getBody();
        $progress = $connection->getOffBoardPlayerProgress($player['id'], $playerResult);
        array_push($json, $progress);
    }

    $response->getBody()->write(json_encode($json));
    return $response;
});

$app->get('/setPlayerUID/{uid}', function (Request $request, Response $response, $args) {
    $uid = (string)$args['uid'];
    $client = new GuzzleHttp\Client();
    $request = new \GuzzleHttp\Psr7\Request('GET', 'http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=' . $uid);
    $result = $client->send($request)->getBody();
    $date = date('Y-m-d');

    $connection = new Database($this->db, $this->logger);
    $connection->setPlayerUID($result, $date);
    
    return $response;
});

$app->get('/names', function (Request $request, Response $response) {

    $connection = new Database($this->db, $this->logger);
    $array = $connection->getPlayerNames();

    $response->getBody()->write($array);
    return $response;
});

$app->get('/progress/{date}', function (Request $request, Response $response, $args) {
    $date = (string)$args['date'];
    $connection = new Database($this->db, $this->logger);
    $array = $connection->getPlayersProgress($date);

    $response->getBody()->write($array);
    return $response;
});

$app->get('/data/{player}', function (Request $request, Response $response, $args) {
    $name = (string)$args['player'];
    $connection = new Database($this->db, $this->logger);
    $array = $connection->getPlayerData($name);

    $response->getBody()->write($array);
    return $response;
});

$app->get('/init', function (Request $request, Response $response) {
    $client = new GuzzleHttp\Client();
    $request = new \GuzzleHttp\Psr7\Request('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');
    $result = $client->send($request)->getBody();
    $date = date('Y-m-d');

    $connection = new Database($this->db, $this->logger);
    $array = $connection->setPlayerData($result, $date);

    $response->getBody()->write("Database initialized");
    return $response;
});


$app->run();