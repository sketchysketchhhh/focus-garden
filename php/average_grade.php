<?php
// Computes a student's average grade and displays the remarks
// using an if-else (selection) structure.

$quiz = $attendance = $recitation = $prelim = "";
$average = null;
$remarks = "";

if (isset($_POST['compute'])) {
    $quiz       = (float) $_POST['quiz'];
    $attendance = (float) $_POST['attendance'];
    $recitation = (float) $_POST['recitation'];
    $prelim     = (float) $_POST['prelim'];

    $average = ($quiz + $attendance + $recitation + $prelim) / 4;

    if ($average >= 90) {
        $remarks = "Outstanding";
    } elseif ($average >= 85) {
        $remarks = "Very Satisfactory";
    } elseif ($average >= 80) {
        $remarks = "Satisfactory";
    } elseif ($average >= 75) {
        $remarks = "Fairly Satisfactory";
    } else {
        $remarks = "Did Not Meet Expectations";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Student Average Grade Calculator</title>
    <style>
        body { font-family: Arial, sans-serif; }
        td { padding: 4px 6px; }
        .result { font-size: 18px; }
    </style>
</head>
<body>
    <h2>Student Average Grade Calculator</h2>

    <form method="post" action="">
        <table>
            <tr>
                <td>Quiz Grade :</td>
                <td><input type="number" name="quiz" min="0" max="100" step="any" value="<?php echo $quiz; ?>" required></td>
            </tr>
            <tr>
                <td>Attendance Grade :</td>
                <td><input type="number" name="attendance" min="0" max="100" step="any" value="<?php echo $attendance; ?>" required></td>
            </tr>
            <tr>
                <td>Recitation Grade :</td>
                <td><input type="number" name="recitation" min="0" max="100" step="any" value="<?php echo $recitation; ?>" required></td>
            </tr>
            <tr>
                <td>Prelim Exam Grade :</td>
                <td><input type="number" name="prelim" min="0" max="100" step="any" value="<?php echo $prelim; ?>" required></td>
            </tr>
            <tr>
                <td></td>
                <td><input type="submit" name="compute" value="Compute"></td>
            </tr>
        </table>
    </form>

    <?php if ($average !== null) { ?>
    <div class="result">
        Average : <?php echo round($average, 2); ?><br>
        Remarks : <?php echo $remarks; ?>
    </div>
    <?php } ?>
</body>
</html>
