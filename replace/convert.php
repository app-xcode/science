<?php
// Contoh data (input dari JSON kamu)
$data = json_decode(file_get_contents("r.json"), true);
$references = $data["references"];

$result = [];

$shortJournal = [
    "International Journal of Educational Technology in Higher Education" => "Int. J. Educ. Technol. High. Educ.",
    "International Journal of Interactive Mobile Technologies" => "Int. J. Interact. Mob. Technol.",
    "International Journal of Evaluation and Research in Education" => "Int. J. Eval. Res. Educ.",
    "Education and Information Technologies" => "Educ. Inf. Technol.",
    "Turkish Online Journal of Distance Education" => "Turk. Online J. Distance Educ.",
    "Sustainability (Switzerland)" => "Sustainability",
    "The theory and practice of online learning" => "Theory Pract. Online Learn."
];

$counter = 1;

foreach ($references as $ref) {
    // Buat label: kalau >2 penulis → "NamaEtAl, Tahun"
    $authors = $ref["authors"];
    $year = $ref["year"];
    $label = "";

    if (count($authors) > 2) {
        $firstAuthor = explode(",", $authors[0])[0];
        $label = $firstAuthor . " et al., " . $year;
    } elseif (count($authors) == 2) {
        $a1 = explode(",", $authors[0])[0];
        $a2 = explode(",", $authors[1])[0];
        $label = $a1 . " and " . $a2 . ", " . $year;
    } else {
        $label = explode(",", $authors[0])[0] . ", " . $year;
    }

    // Konversi authors ke format
    $authorsArr = [];
    foreach ($authors as $a) {
        $parts = explode(",", $a);
        $surname = trim($parts[0]);
        $given = isset($parts[1]) ? trim($parts[1]) : "";
        $authorsArr[] = [
            "#name" => "author",
            "$$" => [
                ["#name" => "given-name", "_" => $given],
                ["#name" => "surname", "_" => $surname]
            ]
        ];
    }

    // Judul
    $titleArr = [
        "#name" => "title",
        "$$" => [
            ["#name" => "maintitle", "_" => $ref["title"]]
        ]
    ];

    // Host (journal, volume, issue, pages, year)
    $hostArr = [
        "#name" => "host",
        "$$" => [
            [
                "#name" => "issue",
                "$$" => [
                    [
                        "#name" => "series",
                        "$$" => [
                            [
                                "#name" => "title",
                                "$$" => [
                                    ["#name" => "maintitle", "_" => $shortJournal[$ref["journal"]] ?? $ref["journal"]]
                                ]
                            ]
                        ]
                    ],
                    ["#name" => "date", "_" => (string)$year]
                ]
            ]
        ]
    ];

    if (!empty($ref["volume"])) {
        $hostArr["$$"][0]["$$"][0]["$$"][] = ["#name" => "volume-nr", "_" => $ref["volume"]];
    }
    if (!empty($ref["issue"])) {
        $hostArr["$$"][0]["$$"][] = ["#name" => "issue-nr", "_" => $ref["issue"]];
    }
    if (!empty($ref["pages"]) && preg_match("/\d+–\d+/", $ref["pages"])) {
        $hostArr["$$"][] = ["#name" => "article-number", "_" => $ref["pages"]];
    }

    // Source text
    $sourceAuthors = [];
    foreach ($authors as $a) {
        $sourceAuthors[] = str_replace(",", "", $a);
    }
    $sourceText = implode(", ", $sourceAuthors) . " ($year). " . $ref["title"];
    if ($ref["journal"]) {
        $sourceText .= ". " . $ref["journal"];
    }
    if ($ref["volume"]) {
        $sourceText .= ", " . $ref["volume"];
        if ($ref["issue"]) {
            $sourceText .= "(" . $ref["issue"] . ")";
        }
    }
    if ($ref["pages"]) {
        $sourceText .= ", " . $ref["pages"];
    }
    if ($ref["doi"]) {
        $sourceText .= ". " . $ref["doi"];
    }

    $result[] = [
        "#name" => "bib-reference",
        "$" => ["id" => "bib" . $counter],
        "$$" => [
            ["#name" => "label", "_" => $label],
            [
                "#name" => "reference",
                "$" => ["id" => "sbref" . $counter, "refId" => (string)$counter],
                "$$" => [
                    [
                        "#name" => "contribution",
                        "$" => ["langtype" => "en"],
                        "$$" => [
                            ["#name" => "authors", "$$" => $authorsArr],
                            $titleArr
                        ]
                    ],
                    $hostArr
                ]
            ],
            ["#name" => "source-text", "$" => ["id" => "srct00" . $counter], "_" => $sourceText]
        ]
    ];

    $counter++;
}

// Output JSON
header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

