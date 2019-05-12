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

    public function initDatabase($leaderboardJson)
    {
        $leaderboard = json_decode($leaderboardJson, true);

        $players = $this->extractDistinctPlayers($leaderboard);
        $this->insertPlayers($players);
        $this->getPlayerIds();

        $playersState = $this->extractPlayersLeaderboardEntry($leaderboard, $players);
        $this->insertPlayersState($playersState);
    }

    public function clearDatabase()
    {
        $sql = "DELETE FROM state; DELETE FROM progress; DELETE FROM player;";
        $this->pdo->query($sql);
    }

    public function setPlayerUID($playerDataJson)
    {
        $playerData = json_decode($playerDataJson, true);
        $name = $playerData['last_name'];

        if (array_key_exists($name, $this->playerIds)) {
            $this->updatePlayerUID($name, $playerData["Uid"]);
        } else {
            $this->initializePlayer($playerData);
        }
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

    public function snapshotPreview($leaderboardJson)
    {
        $leaderboard = json_decode($leaderboardJson, true);
        $knownLeaderboardPLayers = $this->getKnownPlayersFromLeaderboard($leaderboard);

        $knownPlayersLeaderboardEntry = $this->extractPlayersLeaderboardEntry($leaderboard, $knownLeaderboardPLayers);
        $knownPlayersLatestState = $this->getPlayersLatestState($knownLeaderboardPLayers);
        $playersProgress = $this->progressService->getPlayersProgress($knownPlayersLeaderboardEntry, $knownPlayersLatestState);

        return $playersProgress;
    }

    public function snapshotLeaderboard($leaderboardJson)
    {
        $leaderboardPlayersProgress = $this->snapshotPreview($leaderboardJson);

        $leaderboard = json_decode($leaderboardJson, true);
        $leaderboardPlayers = $this->extractDistinctPlayers($leaderboard);
        $newLeaderboardPlayers = $this->getNewLeaderboardPlayers($leaderboardPlayers);

        if (sizeof($newLeaderboardPlayers) > 0) {
            $this->insertPlayers($newLeaderboardPlayers);
            $this->getPlayerIds();
        }

        $progressEntries = $this->progressContentsToProgressEntries($leaderboardPlayersProgress);
        $this->insertPlayersProgress($progressEntries);

        $newPlayersName = $this->getNameFromPlayers($newLeaderboardPlayers);
        $knowLeaderboardPLayers = $this->excludePlayersByName($leaderboardPlayers, $newPlayersName);
        $this->updatePlayersInLeaderboard($knowLeaderboardPLayers, 1);

        $leaderboardPlayersName = $this->getNameFromPlayers($leaderboardPlayers);
        $offBoardPlayers = $this->excludePlayersByName($this->getPlayers(), $leaderboardPlayersName);
        $this->updatePlayersInLeaderboard($offBoardPlayers, 0);

        $playersState = $this->extractPlayersLeaderboardEntry($leaderboard, $leaderboardPlayers);
        $this->insertPlayersState($playersState);
    }

    public function snapshotOffBoard($playersDataJson)
    {
        $playersData = json_decode($playersDataJson, true);
        $players = $this->extractDistinctPlayers($playersData);

        $playersProgress = $this->snapshotPreview($playersDataJson);
        $progressEntries = $this->progressContentsToProgressEntries($playersProgress);
        $this->insertPlayersProgress($progressEntries);

        $playersState = $this->extractPlayersLeaderboardEntry($playersData, $players);
        $this->insertPlayersState($playersState);
    }

    public function getOffBoardPlayersUID($leaderboardJson)
    {
        $leaderboard = json_decode($leaderboardJson, true);
        $registeredPlayers = $this->getRegisteredPLayers();
        $leaderboardPlayers = $this->extractDistinctPlayers($leaderboard);
        $leaderboardNames = $this->getNameFromPlayers($leaderboardPlayers);
        $offBoardPlayers = $this->excludePlayersByName($registeredPlayers, $leaderboardNames);

        $uids = [];
        foreach ($offBoardPlayers as $offBoardPlayer) {
            array_push($uids, $offBoardPlayer["guid"]);
        }

        return $uids;
    }

    private function getRegisteredPLayers()
    {
        $sql = "SELECT name, guid FROM player WHERE guid IS NOT NULL";
        return $this->executeSqlQuery($sql, []);
    }

    private function initializePlayer($playerData)
    {
        $name = $playerData['last_name'];
        $uid = $playerData['Uid'];

        $this->insertPlayer($name, 0, $uid);
        $this->getPlayerIds();
        $id = $this->playerIds[$name];

        $state = $this->playerDataToPlayerSate($id, $playerData);
        $this->insertPlayersState([$state]);
    }

    private function updatePlayerUID($playerName, $uid)
    {
        $id = $this->playerIds[$playerName];
        $sql = "UPDATE player SET guid=? WHERE id=?";
        $this->executeSqlQuery($sql, [$uid, $id]);
    }

    private function playerDataToPlayerSate($playerId, $playerData)
    {
        $date = date('Y-m-d');
        $content = array(
            "goals" => $playerData['goals'],
            "assists" => $playerData['assists'],
            "Wins" => $playerData['Wins'],
            "Draws" => $playerData['Draws'],
            "Losses" => $playerData['Losses'],
            "Experience" => $playerData['Experience'],
            "last_name" => $playerData['last_name']
        );

        $jsonContent = json_encode($content);

        return array("player" => $playerId, "stateDate" => $date, "content" => $jsonContent);
    }

    private function getPlayersLatestState($players)
    {
        $names = $this->getNameFromPlayers($players);
        $namesInput = $this->sqlHelper->generatePropertyInputTemplate(sizeof($names));

        $sql = "SELECT s.player, s.stateDate, s.content
                FROM state s 
                    LEFT JOIN player p ON
                        p.id = s.player
                WHERE p.name IN $namesInput AND (s.player, s.stateDate) IN 
                    (SELECT player, MAX(stateDate) FROM state GROUP BY player)";

        return $this->executeSqlQuery($sql, $names);
    }

    private function getNewLeaderboardPlayers($leaderboardPlayers)
    {
        $knownNames = $this->getPlayerNames();
        $newPlayers = $this->excludePlayersByName($leaderboardPlayers, $knownNames);;

        return $newPlayers;
    }

    private function getKnownPlayersFromLeaderboard($leaderboard)
    {
        $leaderboardPlayers = $this->extractDistinctPlayers($leaderboard);
        $newPlayers = $this->getNewLeaderboardPlayers($leaderboardPlayers);
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

    private function insertPlayers($players)
    {
        $sql = "INSERT INTO player (name, inLeaderBoard) VALUES ";
        $propertiesToSave = 2;

        $queryComponents = $this->sqlHelper->buildInsertQuery($sql, $players, $propertiesToSave);
        $this->executeSqlQuery($queryComponents["query"], $queryComponents["parameters"]);
    }

    private function insertPlayer($name, $inLeaderboard, $uid)
    {
        $sql = "INSERT INTO player (name, guid, inLeaderboard) VALUES (?,?,?)";
        $this->executeSqlQuery($sql, [$name, $uid, $inLeaderboard]);
    }

    private function insertPlayersState($playersState)
    {
        $sql = "INSERT INTO state (player, stateDate, content) VALUES ";
        $propertiesToSave = 3;

        $queryComponents = $this->sqlHelper->buildInsertQuery($sql, $playersState, $propertiesToSave);
        $this->executeSqlQuery($queryComponents["query"], $queryComponents["parameters"]);
    }

    private function progressContentsToProgressEntries($progressContents)
    {
        $date = date('Y-m-d');
        $progressEntries = [];
        foreach ($progressContents as $progressContent) {
            $progressEntry = array(
                "player" => $this->playerIds[$progressContent["last_name"]],
                "progressDate" => $date,
                "content" => json_encode($progressContent)
            );
            array_push($progressEntries, $progressEntry);
        }

        return $progressEntries;
    }

    private function insertPlayersProgress($playersProgress)
    {
        $sql = "INSERT INTO progress (player, progressDate, content) VALUES ";
        $propertiesToSave = 3;

        $queryComponents = $this->sqlHelper->buildInsertQuery($sql, $playersProgress, $propertiesToSave);
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

    private function updatePlayersInLeaderboard($players, $inLeaderboard)
    {
        $names = $this->getNameFromPlayers($players);
        $namesInput = $this->sqlHelper->generatePropertyInputTemplate(sizeof($names));

        $sql = "UPDATE player SET inLeaderboard = $inLeaderboard WHERE name IN $namesInput AND inLeaderboard <> $inLeaderboard";
        $this->executeSqlQuery($sql, $names);
    }

    private function getPlayerNames()
    {
        $results = $this->getPlayers();
        $names = [];
        foreach ($results as $result) {
            array_push($names, $result["name"]);
        }

        return $names;
    }

    private function getPlayers()
    {
        $sql = "SELECT name FROM player";
        return $this->pdo->query($sql)->fetchAll();
    }

    private function executeSqlQuery($sql, $parameters)
    {
        $queryResult = $this->pdo->prepare($sql);
        $queryResult->execute($parameters);

        if (strpos($sql, "SELECT") == false) {
            return $queryResult;
        } else {
            return $queryResult->fetchAll();
        }
    }
}
