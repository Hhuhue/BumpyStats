<?php

namespace Classes;

use function GuzzleHttp\json_encode;

class Database
{
    private $pdo;
    private $logger;
    private $playerIds;
    private $sqlHelper;
    private $progressService;

    public function __construct($pdo, $logger, $sqlHelper, $progressService)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
        $this->sqlHelper = $sqlHelper;
        $this->progressService = $progressService;

        $this->getPlayerIds();
    }

    public function initDatabase($leaderBoardJson)
    {
        $leaderboard = json_decode($leaderBoardJson, true);

        $players = $this->extractDistinctPlayers($leaderboard);
        $this->insertPlayers($players);
        $this->getPlayerIds();

        $playersState = $this->extractPlayersLeaderboardEntry($leaderboard, $players);
        $this->insertPlayersState($playersState);
    }

    public function getPlayersProgress($date)
    {
        $sql = "SELECT content FROM progress WHERE progressDate >= $date";
        $result = $this->pdo->query($sql)->fetchAll();

        $progresses = [];
        foreach ($result as $progress) {
            array_push($progresses, json_decode($progress['content'], true));
        }

        return json_encode($progresses);
    }

    public function getPlayerData($player)
    {
        $id = $this->playerIds[$player];

        $dateObj = new DateTime(date('Y-m-d'));
        $dateObj->sub(new DateInterval('P7D'));
        $lastWeek = $dateObj->format('Y-m-d');

        if ($id == -1) return -1;

        $progresses = "SELECT content, progressDate FROM progress WHERE player = $id AND progressDate >= '$lastWeek'";
        $states = "SELECT content, stateDate FROM state WHERE player = $id  AND stateDate >= '$lastWeek'";

        $result = $this->pdo->query($progresses)->fetchAll();
        $progressArray = [];

        foreach ($result as $progress) {
            $json = json_decode($progress['content'], true);
            $json['Date'] = $progress['progressDate'];
            array_push($progressArray, $json);
        }

        $result = $this->pdo->query($states)->fetchAll();
        $stateArray = [];

        foreach ($result as $state) {
            $json = json_decode($state['content'], true);
            $json['Date'] = $state['stateDate'];
            array_push($stateArray, $json);
        }

        $data = [];
        $data['states'] = $stateArray;
        $data['progress'] = $progressArray;

        return json_encode($data);
    }

    public function snapshot($json, $date)
    {
        $this->setPlayerData($json, $date);

        $getStates = "SELECT player, content FROM state WHERE stateDate=?";
        $isInLeaderboard = "SELECT inLeaderboard FROM player WHERE id = ?";

        $stmt = $this->pdo->prepare($getStates);
        $stmt->execute([$date]);
        $newStates = $stmt->fetchAll();

        $fallens = json_decode($this->getPlayerNames());

        foreach ($newStates as $data) {
            $state = json_decode($data['content'], true);
            $id = $data['player'];
            $name = $state['last_name'];

            //The player has not fallen off the leaderboard
            $index = array_search($name, $fallens);
            unset($fallens[$index]);

            //Check if the player was in the leaderboard before
            $stmt = $this->pdo->prepare($isInLeaderboard);
            $stmt->execute([$id]);
            $inLeaderboard = $stmt->fetch()['inLeaderboard'];

            if ($inLeaderboard == 0) {
                $this->updatePlayerInLeaderboard($name, 1);
            }

            //Set player progess if sufficient data is available
            $oldState = $this->getPreviousState($id, $date);
            if ($oldState != -1) {
                $this->insertPlayerProgress($oldState, $state, $id, $date);
            }
        }

        //Update the players who have fallen
        foreach ($fallens as $fallen) {
            $this->updatePlayerInLeaderboard($fallen, 0);
        }

        return $this->getUpdatablePlayers($fallens);
    }

    public function setPlayerUID($json, $date)
    {
        $data = json_decode($json, true);
        $name = $data['last_name'];
        $uid = $data['Uid'];
        $id = $this->playerIds[$name];

        if ($id == -1) {
            $this->insertPlayer($data['last_name'], 0, $uid);
            $id = $this->playerIds[$name];

            $sql = "INSERT INTO state (player, stateDate, content) VALUES (?,?,?)";
            $state = array(
                "goals" => $data['goals'],
                "assists" => $data['assists'],
                "Wins" => $data['Wins'],
                "Draws" => $data['Draws'],
                "Losses" => $data['Losses'],
                "Experience" => $data['Experience'],
                "last_name" => $data['last_name'],
                "Position" => "NA"
            );
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id, $date, json_encode($state)]);
        } else {
            $sql = "UPDATE player SET guid=? WHERE id=?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$uid, $id]);
        }
    }

    public function snapshotPreview($leaderboardJson)
    {
        $leaderboard = json_decode($leaderboardJson, true);
        $knownLeaderboardPLayers = $this->getKnownPlayersFromLeaderboard($leaderboard);
        
        $knownPlayersLeaderboardEntry = $this->extractPlayersLeaderboardEntry($leaderboard, $knownLeaderboardPLayers);
        $knownPlayersLatestState = $this->getPlayersLatestState($knownLeaderboardPLayers);
        $playersProgress = $this->progressService->getPlayersProgress($knownPlayersLeaderboardEntry, $knownPlayersLatestState);

        return $playersProgress;
    }

    private function getPlayersLatestState($players)
    {         
        $names = $this->getNameFromPlayers($players);
        $namesInput = $this->sqlHelper->generatePropertyInputTemplate(sizeof($names));
        $nameSet = $this->nameSetToString($names);

        $sql = "SELECT s.player, s.stateDate, s.content
                FROM bumpystatsdb.state s 
                    LEFT JOIN bumpystatsdb.player p ON
                        p.id = s.player
                WHERE p.name IN $namesInput AND (s.player, s.stateDate) IN 
                    (SELECT player, MAX(stateDate) FROM bumpystatsdb.state GROUP BY player)";
        
        return $this->executeSqlQuery($sql, $names);
    }

    private function nameSetToString($names)
    {
        $nameSetString = "('" . $names[0] . "'";
        for ($i = 1; $i < sizeof($names); $i++) {
            $nameSetString = $nameSetString . ",'" . $names[$i] . ",";
        }

        return $nameSetString . ")";
    }

    private function getKnownPlayersFromLeaderboard($leaderboard)
    {
        $leaderboardPlayers = $this->extractDistinctPlayers($leaderboard);
        $knownNames = $this->getPlayerNames();

        $newPlayers = $this->excludePlayersByName($leaderboardPlayers, $knownNames);
        $newPlayersName = $this->getNameFromPlayers($newPlayers);

        return $this->excludePlayersByName($leaderboardPlayers, $newPlayersName);
    }

    private function getNameFromPlayers($players)
    {
        $playersName = [];
        foreach ($players as $player) {
            array_push($playersName, $player["name"]);
        }

        return $playersName;
    }

    private function excludePlayersByName($players, $namesToExclude)
    {
        $result = [];

        foreach ($players as $player) {
            if (!in_array($player["name"], $namesToExclude)) {
                array_push($result, $player);
            }
        }

        return $result;
    }

    public function getOffBoardPlayerProgress($id, $json)
    {
        $sql = "SELECT id, content FROM state WHERE player=? ORDER BY id DESC LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $result = $stmt->fetch();

        $oldState = json_decode($result['content'], true);
        $data = json_decode($json, true);
        $newState = array(
            "goals" => $data['goals'],
            "assists" => $data['assists'],
            "Wins" => $data['Wins'],
            "Draws" => $data['Draws'],
            "Losses" => $data['Losses'],
            "Experience" => $data['Experience']
        );

        $progress = $this->getPlayerProgress($oldState, $newState);
        if ($progress != 0) {
            $progress['Position'] = "NA";
            $progress['last_name'] = $data['last_name'];
        }

        return $progress;
    }

    public function setOffBoardPlayerProgress($id, $json, $date)
    {
        $sql = "SELECT id, content FROM state WHERE player=? ORDER BY id DESC LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $result = $stmt->fetch();

        $oldState = json_decode($result['content'], true);

        $data = json_decode($json, true);
        $newState = array(
            "goals" => $data['goals'],
            "assists" => $data['assists'],
            "Wins" => $data['Wins'],
            "Draws" => $data['Draws'],
            "Losses" => $data['Losses'],
            "Experience" => $data['Experience'],
            "last_name" => $data['last_name'],
            "Position" => "NA"
        );

        $sql = "INSERT INTO state (player, stateDate, content) VALUES (?,?,?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id, $date, json_encode($newState)]);
        $newState['Position'] = 0;
        $oldState['Position'] = 0;

        $progress = $this->getPlayerProgress($oldState, $newState);
        if ($progress != 0) {
            $progress['Position'] = "NA";
            $progress['last_name'] = $data['last_name'];

            $sql = "INSERT INTO progress (player, progressDate, content) VALUES (?,?,?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id, $date, json_encode($progress)]);
        }
    }

    private function getUpdatablePlayers($names)
    {
        $players = [];
        foreach ($names as $name) {
            $sql = "SELECT id, guid FROM player WHERE name = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$name]);
            $data = $stmt->fetch();

            if (strlen($data['guid']) > 0) {
                array_push($players, array('id' => $data['id'], 'guid' => $data['guid']));
            }
        }

        return $players;
    }

    //TODO : Remove
    private function updatePlayerInLeaderboard($name, $inLeaderboard)
    {
        $sql = "UPDATE player SET inLeaderboard=? WHERE name=?";
        $this->executeSqlQuery($sql, [$inLeaderboard, $name]);
    }

    //TODO : Remove
    private function insertPlayerProgress($oldSpecs, $newSpecs, $id, $date)
    {
        $playerProgress = $this->getPlayerProgress($oldSpecs, $newSpecs);

        if ($playerProgress == 0) return -1;

        $sql = "INSERT INTO progress (player, progressDate, content) VALUES (?,?,?)";
        $this->executeSqlQuery($sql, [$id, $date, json_encode($playerProgress)]);
    }
    
    private function insertPlayers($players)
    {
        $sql = "INSERT INTO player (name, inLeaderBoard) VALUES ";
        $propertiesToSave = 2;

        $queryComponents = $this->sqlHelper->buildInsertQuery($sql, $players, $propertiesToSave);
        $this->executeSqlQuery($queryComponents["query"], $queryComponents["parameters"]);
    }

    private function insertPlayersState($playersState)
    {
        $sql = "INSERT INTO state (player, stateDate, content) VALUES ";
        $propertiesToSave = 3;

        $queryComponents = $this->sqlHelper->buildInsertQuery($sql, $playersState, $propertiesToSave);
        $this->executeSqlQuery($queryComponents["query"], $queryComponents["parameters"]);
    }

    private function extractDistinctPlayers($leaderboard)
    {
        $names = [];
        $players = [];

        for ($i = 0; $i < sizeof($leaderboard); $i++) {
            $entry = $leaderboard[$i];
            $name = $entry['last_name'];
            if (!in_array($name, $names)) {
                $player = array(
                    "name" => $name,
                    "inLeaderBoard" => true,
                    "index" => $i
                );

                array_push($players, $player);
                array_push($names, $name);
            }
        }

        return $players;
    }

    private function extractPlayersLeaderboardEntry($leaderboard, $players)
    {
        $playersState = [];
        $date = date('Y-m-d');

        for ($i = 0; $i < sizeof($players); $i++) {
            $player = $players[$i];
            $leaderboardEntry = $leaderboard[$player["index"]];
            $leaderboardEntry["Position"] = $i + 1;

            array_push($playersState, array(
                "player" => $this->playerIds[$player["name"]],
                "stateDate" => $date,
                "content" => json_encode($leaderboardEntry)
            ));
        }

        return $playersState;
    }

    private function getPlayerIds()
    {
        $this->playerIds = [];
        $sql = "SELECT name, id FROM player";
        $result = $this->executeSqlQuery($sql, []);

        $this->playerIds = [];
        foreach ($result as $playerRecord) {
            $this->playerIds[$playerRecord['name']] = $playerRecord["id"];
        }
    }

    private function getPlayerNames()
    {
        $sql = "SELECT name FROM player";
        $results = $this->pdo->query($sql)->fetchAll();
        $names = [];
        foreach ($results as $result) {
            array_push($names, $result["name"]);
        }

        return $names;
    }

    private function executeSqlQuery($sql, $parameters)
    {
        $queryResult = $this->pdo->prepare($sql);
        $queryResult->execute($parameters);

        return $queryResult->fetchAll();
    }
}
