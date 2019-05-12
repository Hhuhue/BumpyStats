<?php
header("Access-Control-Allow-Origin: *");
require '../../vendor/autoload.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Classes\Database as Database;
use Classes\SqlHelper  as SqlHelper ;
use Classes\ProgressService as ProgressService;

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;

$config['db']['host']   = 'localhost';
$config['db']['user']   = 'dev';
$config['db']['pass']   = 'Welcome!123';
$config['db']['dbname'] = 'bumpystatsdb';

$app = new \Slim\App(['settings' => $config]);

$container = $app->getContainer();

$container['logger'] = function ($c) {
    $logger = new \Monolog\Logger('my_logger');
    $file_handler = new \Monolog\Handler\StreamHandler('../logs/app.log');
    $logger->pushHandler($file_handler);
    return $logger;
};

$container['db'] = function ($c) {
    $db = $c['settings']['db'];
    $pdo = new PDO('mysql:host=' . $db['host'] . ';dbname=' . $db['dbname'], $db['user'], $db['pass'], []);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};

function ExecuteWebRequest($type, $url)
{
    $client = new GuzzleHttp\Client();
    $request = new \GuzzleHttp\Psr7\Request($type, $url);
    return $client->send($request)->getBody();
}

function CreateDBConnection($context)
{
    return new Database($context->db, $context->logger, new SqlHelper (), new ProgressService());
}

function GetPlayersStateFromUids($playersUid)
{
    $playersState = [];
    foreach ($playersUid as $playerUid) {
        $playerState = ExecuteWebRequest('GET', 'http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=' . $playerUid);
        array_push($playersState, json_decode($playerState, true));
    }

    return $playersState;
}

$app->get('/snapshot-preview', function (Request $request, Response $response) {

    $leaderboardJson = ExecuteWebRequest('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');

    $connection = CreateDBConnection($this);
    $leaderboardPlayersProgress = $connection->snapshotPreview($leaderboardJson);

    $offboardPlayersUids = $connection->getOffBoardPlayersUID($leaderboardJson);
    $offboardPlayersState = GetPlayersStateFromUids($offboardPlayersUids);
    $offboardPlayersProgress = $connection->snapshotPreview(json_encode($offboardPlayersState));

    $playresProgress = array_merge($leaderboardPlayersProgress, $offboardPlayersProgress);

    $response->getBody()->write(json_encode($playresProgress));
    return $response;
});

$app->get('/snapshot', function (Request $request, Response $response) {
    $leaderboardJson = ExecuteWebRequest('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');

    $connection = CreateDBConnection($this);
    $connection->snapshotLeaderboard($leaderboardJson);

    $offboardPlayersUids = $connection->getOffBoardPlayersUID($leaderboardJson);
    $offboardPlayersState = GetPlayersStateFromUids($offboardPlayersUids);
    $connection->snapshotOffBoard(json_encode($offboardPlayersState));

    $response->getBody()->write("Snapshot success");

    return $response;
});

$app->get('/setPlayerUID/{uid}', function (Request $request, Response $response, $args) {
    $uid = (string)$args['uid'];
    $result = ExecuteWebRequest('GET', 'http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=' . $uid);

    $connection = CreateDBConnection($this);
    $connection->setPlayerUID($result);

    return $response;
});

$app->get('/data/{player}', function (Request $request, Response $response, $args) {
    $name = urldecode((string)$args['player']);
    $this->logger->info($name);
    $connection = CreateDBConnection($this);
    $playerData = $connection->getPlayerData($name);

    $response->getBody()->write($playerData);
    return $response;
});

$app->get('/init', function (Request $request, Response $response) {
    $leaderboardJson = ExecuteWebRequest('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');

    $connection = CreateDBConnection($this);
    $connection->initDatabase($leaderboardJson);

    $response->getBody()->write("Database initialized");
    return $response;
});

$app->get('/clear', function (Request $request, Response $response) {   
    $connection = CreateDBConnection($this);
    $connection->clearDatabase();

    $response->getBody()->write("Database cleared");
    return $response;
});

$app->run();
