<?php

// $mysqli = new mysqli('localhost','root','password','gifts4good');
$mysqli = new mysqli('fastapps04.qut.edu.au','n9136690', 'oneplus','n9136690');
if ($mysqli->connect_errno) {
    exit();
}

// $id = $_GET('id');
$id = 1;

$query = "SELECT * FROM downloads WHERE member_id = '" . $id . "'";

$result = $mysqli->query($query);

$row = $result->fetch_array(MYSQLI_ASSOC);

// add timestamp
$date = date("Y-m-d");

echo($row['member_id']."+".$row['cause']."+".$date);

$result->free();

$mysqli->close();

?>
