<?php
header('Content-Type: application/json');

$apiKey = "b7e5e6167d1643dfaf4f31e8ebd72599"; // keep private

if (!isset($_GET['start']) || !isset($_GET['end'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

$start = urlencode($_GET['start']);
$end = urlencode($_GET['end']);

$url = "https://api.geoapify.com/v1/routing?waypoints=$start|$end&mode=drive&apiKey=$apiKey";

$response = @file_get_contents($url);

if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(["error" => "Geoapify request failed"]);
    exit;
}

echo $response;
?>
