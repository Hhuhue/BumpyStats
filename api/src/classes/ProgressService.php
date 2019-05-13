<?php

namespace Classes;

use function GuzzleHttp\json_decode;

class ProgressService
{
    public const NO_PROGRESS_FLAG = -1;
    public const MAX_PROGRESS_VALUE = 50000;

    public function getPlayersProgress($playersOldState, $playersNewState)
    {
        $playersNewAttributesMap = [];
        foreach ($playersNewState as $playerNewSate) {
            $playersNewAttributesMap[$playerNewSate["player"]] = $this->getAttributesFromPlayerState($playerNewSate);
        }

        $playersProgress = [];
        foreach ($playersOldState as $playerOldState) {
            $player = $playerOldState["player"];
            $playerOldAttributes = $this->getAttributesFromPlayerState($playerOldState);

            $playerProgress = $this->getPlayerProgress($playerOldAttributes, $playersNewAttributesMap[$player]);

            if($playerProgress != self::NO_PROGRESS_FLAG){
                array_push($playersProgress, $playerProgress);
            }
        }

        return $playersProgress;
    }

    private function getAttributesFromPlayerState($playerSate)
    {
        return json_decode($playerSate["content"], true);
    }

    private function getPlayerProgress($playerOldAttributes, $playerNewAttributes)
    {
        $progressData = array();
        $progressData['last_name'] = $playerNewAttributes['last_name'];

        $progressTotal = 0;
        if($playerNewAttributes == null) return self::NO_PROGRESS_FLAG;

        foreach ($playerNewAttributes as $attribute => $attributeValue) {
            if ($this->attributeIsSupported($attribute)) {
                $attributeProgress = $this->getPlayerAttributeProgress($attribute, $attributeValue, $playerOldAttributes[$attribute]);

                if ($attributeProgress == self::NO_PROGRESS_FLAG) return self::NO_PROGRESS_FLAG;

                $progressTotal = $progressTotal + $attributeProgress;
                $progressData[$attribute] = $attributeProgress;
            }
        }

        if ($progressTotal == 0) return $this::NO_PROGRESS_FLAG;;

        return $progressData;
    }

    private function attributeIsSupported($attribute)
    {
        return $attribute != 'last_name' && 
               $attribute != 'Uid' && 
               $attribute != 'LastUpdate' &&
               $attribute != 'currency' &&
               $attribute != 'skin_id' && 
               $attribute != 'Created';
    }

    private function getPlayerAttributeProgress($attribute, $oldValue, $newValue)
    {
        if($oldValue == "NA" || $newValue == "NA") return self::NO_PROGRESS_FLAG;
        
        $attributeProgress = $newValue - $oldValue;

        if ($attributeProgress < 0 && $attribute != 'Position') return self::NO_PROGRESS_FLAG;
        if ($attributeProgress > self::MAX_PROGRESS_VALUE) return self::NO_PROGRESS_FLAG;

        return $attributeProgress;
    }
}
