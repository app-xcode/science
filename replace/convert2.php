<?php
// Ambil data awal (misalnya dari file json)
$json = file_get_contents("r.json");
$data = json_decode($json, true);

$refs = $data["references"] ?? [];

$result = [];

foreach ($refs as $i => $ref) {
    $authors = [];
    foreach ($ref["authors"] as $a) {
        $authors[] = trim($a);
    }

    // Gabungkan penulis
    $authorsStr = implode(", ", $authors);

    // Bentuk kalimat citation
    $str = $authorsStr . " (" . $ref["year"] . "), " . $ref["title"];

    if ($ref["journal"]) {
        $str .= ", " . $ref["journal"];
        if ($ref["volume"]) {
            $str .= ", " . $ref["volume"];
            if ($ref["issue"]) {
                $str .= "(" . $ref["issue"] . ")";
            }
        }
        if ($ref["pages"]) {
            $str .= ", " . $ref["pages"];
        }
    }

    // Jika ada DOI, tambahkan
    if ($ref["doi"]) {
        $str .= ". " . $ref["doi"];
    }

    $result[strval($i+1)] = $str . ".";
}

// Output JSON
header("Content-Type: application/json");
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
