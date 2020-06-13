<?php

namespace Classes;

class SqlHelper
{
    public function __construct() { }

    public function buildInsertQuery($base, $entries, $propertyCount)
    {
        $parameters = [];
        $query = $base;
        $propertyInputTemplate = $this->generatePropertyInputTemplate($propertyCount);

        foreach ($entries as $entry) {
            $query = $query . $propertyInputTemplate . ',';
            $values = array_values($entry);
            array_splice($values, $propertyCount);
            $parameters = array_merge($parameters, $values);
        }

        $query = substr($query, 0, strlen($query)-1) . ';';        
        return ["query" => $query, "parameters" => $parameters];
    }

    public function generatePropertyInputTemplate($propertyCount){
        $template = "(?";
        $propertyCount--;

        for ($i=$propertyCount; $i > 0; $i--) { 
            $template = $template . ",?";
        }

        return $template . ")";
    }
}
