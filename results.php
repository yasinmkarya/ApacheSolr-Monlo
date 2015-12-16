<?php
//1. check that a query has been submitted, send user back to search page otherwise
//2. if we have a query term, connect to Solr, query and grab the result
//3. check the results – are there any? If not, display an appropriate messageif there are results, iterate through them and display


//1. check that a query has been submitted, send user back to search page otherwise
if(!isset($_REQUEST['query']) || empty($_REQUEST['query']))
{
 header("Location: http://localhost/Sisolr/search.php");
 }
 else
 {
 $query = $_REQUEST['query'];
}

//2. if we have a query term, connect to Solr, query and grab the result
//our required 
require_once('constants.php');
require_once('SolrPhpClient/Apache/Solr/Service.php');
//instantiate a Solr object
$solr = new Apache_Solr_Service('10.14.211.5', '8983', 'solr/core0');
//run the 
$results = $solr->search($query, 0, 1100);

//3. check the results – are there any? If not, display an appropriate messageif there are results, iterate through them and display
echo '<table>';
echo '<tr><th>ID</th>' .
	  	'<th>Programname</th>' .
		'<th>Hostname</th>' .
 		'<th>Messages</th></tr>';
 		{
 			foreach($results->response->docs as $doc)
 			{
 				echo '<tr><td>' . htmlspecialchars($doc->_id) . '</td>' .
 				'<td>' . htmlspecialchars($doc->programname) .      '</td>' .
 				'<td>' . htmlspecialchars($doc->hostname)  . '</td>' .
 				'<td>' . htmlspecialchars($doc->msg) . '</td></tr>';
 				}
 				}
 				echo '</table>';
?>