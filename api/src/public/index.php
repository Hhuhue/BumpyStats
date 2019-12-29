<?php
header("Access-Control-Allow-Origin: *");
require '../../vendor/autoload.php';
require 'credentials.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Classes\Database as Database;
use Classes\SqlHelper  as SqlHelper ;
use Classes\ProgressService as ProgressService;

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;

$config['db']['host']   = $host;
$config['db']['user']   = $user;
$config['db']['pass']   = $password;
$config['db']['dbname'] = $database;

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
    $registeredPlayersUids = $connection->getRegisteredPlayersUID();
    $registeredPlayersState = GetPlayersStateFromUids($registeredPlayersUids);
    $registeredPlayersProgress = $connection->snapshotPreview(json_encode($registeredPlayersState), true);

    $leaderboardPlayersProgress = $connection->snapshotPreview($leaderboardJson);

    $playersProgress = array_merge($leaderboardPlayersProgress, $registeredPlayersProgress);

    $response->getBody()->write(json_encode($playersProgress));
    return $response;
});

$app->get('/snapshot', function (Request $request, Response $response) {
    $leaderboardJson = ExecuteWebRequest('GET', 'http://listing.usemapsettings.com/Leaderboard?Limit=250');

    $connection = CreateDBConnection($this);
    $registeredPlayersUids = $connection->getRegisteredPlayersUID();
    $registeredPlayersState = GetPlayersStateFromUids($registeredPlayersUids);    
    $connection->snapshotRegistered(json_encode($registeredPlayersState));

    $connection->snapshotLeaderboard($leaderboardJson);
    
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
    $name = (string)$args['player'];
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

$app->get('/latest-progress', function (Request $request, Response $response) {   
    $connection = CreateDBConnection($this);
    $latestProgresses = $connection->getPlayersLatestProgress();

    $response->getBody()->write(json_encode($latestProgresses));
    return $response;
});

$app->get('/average-time/{player}', function (Request $request, Response $response, $args) {   
    $name = (string)$args['player'];
    $connection = CreateDBConnection($this);
    $averagePlayTime = $connection->getPlayerAverageSessionTime($name);

    $response->getBody()->write($averagePlayTime);
    return $response;
});

$app->get('/names', function (Request $request, Response $response) {
    $connection = CreateDBConnection($this);
    $names = $connection->getNames();

    $response->getBody()->write($names);
    return $response;
});

$app->run();
