<?php

use function GuzzleHttp\json_encode;

class Database
{
    private $pdo;
    private $logger;

    public function __construct($pdo, $logger)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
    }

    public function setPlayerData($json, $date)
    {
        $sql = "INSERT INTO state (player, stateDate, content) VALUES (?,?,?)";

        $leaderboard = json_decode($json, true);
        //Some players share a name so we only consider the most advanced one
        $visitedPlayers = [];
        $position = 0;

        foreach ($leaderboard as $entry) {
            $position++;
            $name = $entry['last_name'];

            //Check if the name was already encountered
            if (!array_key_exists($name, $visitedPlayers)) {
                $entry['Position'] = $position;
                $visitedPlayers[$name] = 1;

                $id = $this->getPlayerId($name);

                //Add the player to database if he wasn't present
                if ($id == -1) {
                    $this->insertPlayer($name, 1);
                    $id = $this->getPlayerId($name);
                }

                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([$id, $date, json_encode($entry)]);
            }
        }
    }

    public function getPlayerNames()
    {
        $sql = "SELECT name FROM player";
        $result = $this->pdo->query($sql)->fetchAll();

        $names = [];
        foreach ($result as $name) {
            array_push($names, $name['name']);
        }

        return json_encode($names);
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
                $this->updatePlayer($name, 1);
            }
            
            //Set player progess if sufficient data is available
            $oldState = $this->getPreviousState($id, $date);
            if ($oldState != -1) {
                $this->insertPlayerProgress($oldState, $state, $id, $date);
            }
        }

        //Update the players who have fallen
        foreach ($fallens as $fallen) {
            $this->updatePlayer($fallen, 0);
        }
    }

    public function snapshotPreview($json, $date){
        $newStates = json_decode($json, true);

        $fallens = json_decode($this->getPlayerNames());
        $dateObj = new DateTime($date);
        $dateObj->add(new DateInterval('P1D'));
        $tomorrow = $dateObj->format('Y-m-d');

        $progresses = [];
        $position = 0;
        foreach ($newStates as $state) {
            $position++;
            $name = $state['last_name'];
            $id = $this->getPlayerId($name);
            $state['Position'] = $position;

            if($id == -1) continue;

            $oldState = $this->getPreviousState($id, $tomorrow);
            if ($oldState != -1) {
                $progress = $this->getPlayerProgress($oldState, $state);
                if($progress != 0){
                    array_push($progresses, $progress);
                }
            }
        }

        return json_encode($progresses);
    }

    private function insertPlayer($name, $inLeaderboard, $guid = "")
    {
        $insertPlayer = "INSERT INTO player (name, guid, inLeaderboard) VALUES (?,?,?)";
        $stmt = $this->pdo->prepare($insertPlayer);
        $stmt->execute([$name, $guid, $inLeaderboard]);
    }

    private function updatePlayer($name, $inLeaderboard, $guid = "")
    {
        $updatePlayer = "UPDATE player SET guid=?, inLeaderboard=? WHERE name=?";
        $stmt = $this->pdo->prepare($updatePlayer);
        $stmt->execute([$guid, $inLeaderboard, $name]);
    }

    private function insertPlayerProgress($oldSpecs, $newSpecs, $id, $date)
    {
        $array = $this->getPlayerProgress($oldSpecs, $newSpecs);        

        if ($array == 0) return -1;

        $insertProgress = "INSERT INTO progress (player, progressDate, content) VALUES (?,?,?)";
        $stmt = $this->pdo->prepare($insertProgress);
        $stmt->execute([$id, $date, json_encode($array)]);
    }

    private function getPlayerProgress($oldSpecs, $newSpecs)
    {
        $array = array();
        $total = 0;
        foreach ($newSpecs as $key => $value) {
            if ($key != 'last_name') {
                $delta = $value - $oldSpecs[$key];
                $total = $total + $delta;
                if ($delta < 0 && $key != 'Position') return 0;

                $array[$key] = $delta;
            }
        }
        $array['last_name'] = $oldSpecs['last_name'];

        if ($total == 0) return 0;

        return $array;
    }

    private function getPlayerId($name)
    {
        $sql = "SELECT id FROM player WHERE name = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$name]);

        if ($stmt->rowCount() < 1) {
            return -1;
        }

        return $stmt->fetch()['id'];
    }

    private function getPreviousState($id, $date)
    {
        $sql = "SELECT player, content FROM state WHERE  player=? AND stateDate < ? ORDER BY id DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id, $date]);

        if ($stmt->rowCount() < 1) {
            return -1;
        }

        return json_decode($stmt->fetch()['content'], true);
    }
}
