<?php
	$query = $_GET(['query']);

	echo("<script>console.log('Query: ".$query."');</script>");

	$con = mysqli_connect('fastapps04.qut.edu.au:3304/n9136690','n9136690','oneplusone','n9136690');
	if (!$con) {
	    die('Could not connect: ' . mysqli_error($con));
	}

	echo($query);

	mysqli_select_db($con,"n9136690");
	$sql="SELECT 'unique_id' FROM members WHERE first_name = '".$query."'";
	$result = mysqli_query($con,$sql);

	mysqli_close($con);
?>