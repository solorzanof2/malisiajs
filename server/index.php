<?php

function write($data, bool $die = false): void
{
    var_dump($data);
    if ($die) {
        die;
    }
}

function logger(string $filename, string $content, string $chmodKey = 'a+b'): void
{
    $path = sprintf("C:\wamp64\www\malisia\server\logs\%s.json", $filename);

    if (!$file = @fopen($path, $chmodKey)) {
        throw new Exception("Could not open file {$filename}");
    }

    flock($file, LOCK_EX);
    fwrite($file, $content);
    flock($file, LOCK_UN);
    fclose($file);

    @chmod($path, '0666');
}

$data = file_get_contents('php://input');

$time = strtotime(date('Y-m-d H:i:s'));

// $jsonData = [
//     'foo' => 'bar',
//     'bar' => 'foo'
// ];
// logger($time, json_encode($jsonData));

// logger($time, json_encode($data));
logger($time, $data);

$data = json_decode($data, true);

$response = [
    'status' => 0,
    'message' => 'OK',
    'response' => $data
];

echo json_encode($response);