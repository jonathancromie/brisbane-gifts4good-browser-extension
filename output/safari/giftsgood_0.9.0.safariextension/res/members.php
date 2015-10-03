<!DOCTYPE html>
<html>
<head>
</head>
<body>

<?php

echo("<script>console.log('Hello');</script>");

$mysqli = new mysqli('fastapps04.qut.edu.au:3306','n9136690','oneplus','n9136690');
if ($mysqli->connect_errno) {
    exit();
}

$search = $_GET('search');
echo("<script>console.log(".$search."<);</script>");

$query = "SELECT unique_id FROM members WHERE first_name = '" . $search . "'";

$result = $mysqli->query($query);

$row = $result->fetch_array(MYSQLI_ASSOC);
echo "<p>".$row['unique_id']."</p>";

$result->free();

$mysqli->close();
?>
</body>
</html>
