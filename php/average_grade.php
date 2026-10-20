<?php
// Computes a student's average grade and displays the remarks
// using an if-else (selection) structure.

$studentName = "Juan Dela Cruz";

$grades = [
    "Mathematics" => 92,
    "Science"     => 88,
    "English"     => 90,
    "Filipino"    => 85,
    "History"     => 94,
];

// Compute the average
$total = 0;
foreach ($grades as $grade) {
    $total += $grade;
}
$average = $total / count($grades);

// Determine the remarks using if-else
if ($average >= 95 && $average <= 100) {
    $remarks = "Excellent";
} elseif ($average >= 90) {
    $remarks = "Very Good";
} elseif ($average >= 85) {
    $remarks = "Good";
} elseif ($average >= 80) {
    $remarks = "Satisfactory";
} elseif ($average >= 75) {
    $remarks = "Passed";
} else {
    $remarks = "Failed";
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Student Average Grade</title>
</head>
<body>
    <h2>Student Grade Report</h2>
    <p><strong>Student Name:</strong> <?php echo $studentName; ?></p>

    <table border="1" cellpadding="6" cellspacing="0">
        <tr>
            <th>Subject</th>
            <th>Grade</th>
        </tr>
        <?php foreach ($grades as $subject => $grade) { ?>
        <tr>
            <td><?php echo $subject; ?></td>
            <td><?php echo $grade; ?></td>
        </tr>
        <?php } ?>
    </table>

    <p><strong>Average Grade:</strong> <?php echo number_format($average, 2); ?></p>
    <p><strong>Remarks:</strong> <?php echo $remarks; ?></p>
</body>
</html>
