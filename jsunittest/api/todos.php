<?php
/*
 * Simple PHP implementation of a REST API compatible with
 * AJAX/JSON javascript frameworks such as backbone.js. To
 * use this script, you'll need .htaccess with mod_rewrite
 * capabilites. Here's a sample .htacess file:
 *
 * Options +FollowSymLinks
 * RewriteEngine On
 * RewriteRule ^([a-zA-Z0-9]+)(\.php)?/([0-9]+)/?$ $1.php?id=$3
 *
 * Put that .htaccess file, along with this script, in a site
 * directory that you want to use for data access, e.g. /data/
 * You can name this script the same as the collection; for
 * example, if you're serving a "todos" collection, name this
 * script todos.php. The script will use its name as the table
 * to query, so if you have multiple collections, just
 * make multiple copies of the script.
 *
 * The script is completely agnostic about whether your database
 * definition agrees with the JSON objects your clients send and/or
 * expect. It will, however, do its best to convert database values
 * into appropriate Javascript types. It does that based on the column
 * definition in the database. In particular,
 *
 *    MySQL bin <-> Javascript boolean
 *    MySQL int, tinyint, bigint, etc. <-> Javascript number
 *    MySQL float, double, decimal <-> Javascript number
 *
 * You're on your own, however, in making sure that the models
 * defined in your javascript match the tables defined in your
 * database. If they don't match, bad things will probably
 * happen.
 *
 * There are also a couple of things to note about error
 * handling in the script. It does attempt to catch all
 * errors, but the response is somewhat crude: generally it
 * simply outputs an HTTP 500 status and abruptly terminates,
 * forgoing, for example, any database cleanup. In most
 * cases that shouldn't be a problem, since PHP is supposed
 * to automatically garbage collect when a script terminates.
 * If you need something more sophisticated, though, you'll
 * have to write it yourself. Secondly, the HTTP error
 * status messages do include a description of what operation
 * caused the error. If you're paranoid about security, you
 * may not want to reveal that kind of information to
 * potential bad guys. If that's the case, just remove the
 * info but leave the "500 Server Error" intact.
 */

/*
 * We start off by defining the general parameters used
 * to actually access the database. They're stored in an
 * external include file for easy sharing, but should
 * look something like:
 *
 * define("HOSTNAME", "localhost");
 * define("USERNAME", "username" );
 * define("PASSWORD", "password" );
 * define("DATABASE", "appname"  );
 *
 */
 
require_once('../php-lib/dbconfig.inc.php');

/*
 * At this point, we've got everything we need to access the
 * database, so go ahead and create a connection to it.
 */

if (!$collection_db = new mysqli(HOSTNAME,USERNAME,PASSWORD,DATABASE)) {
    header("Status: 500 Server Error (Cannot connect to database)");
    exit();                          
}

/*
 * Now we derive the collection being accessed from the name
 * of the script. This collection name will also be used as
 * the database table name.
 */

$collection = basename(__FILE__, '.php');

/*
 * A convenience function to retrieve a specific database
 * row given its unique id. We are assuming that each row
 * includes a column named 'id' that is guaranteed unique.
 * (Generally it will be the primary key.)
 */

function get_row($id) {
  
    global $collection_db, $collection;
    
    /* 
     * We use prepared statements to protect against
     * SQL injection attacks.
     */
    
    if (!$collection_query = $collection_db->prepare(
        "SELECT * FROM $collection WHERE id = ?"
        )) {
        header("Status: 500 Server Error (Cannot prepare query)");
        exit();                          
    }
    if (!$collection_query->bind_param("s", $id)) {
        header("Status: 500 Server Error (Cannot bind query paremeters)");
        exit();                          
    }
    if (!$collection_query->execute()) {
        header("Status: 500 Server Error (Cannot execute query)");
        exit();                          
    }
    if (!$result = $collection_query->get_result()) {
        header("Status: 500 Server Error (Cannot get query result)");
        exit();                          
    }              
    $row = $result->fetch_object();
    
    /* clean up database */
    $collection_query->close();
    
    /* and return the retrieved row */
    return($row);
}

/*
 * Convenience function takes MyQSL result object and coerces
 * individual properties to appropriate types so they can be
 * correctly JSON-encoded. We need this function because the
 * mysqli interface returns everything as a string value.
 * 
 * To determine whether a type coersion is required, we're
 * going to look at how the columns are defined in the 
 * database table. Nothing too surprising here, but note
 * that we' imply a boolean Javascript type from a MySQL
 * bit column type. Presumably, that would be a bit(1) column
 * type, but we don't actually check the size. So if you're
 * actually using bit(N) columns, you'll need to add some
 * extra code here to handle them.
 */

function coerce_object_types($object) {
  
    global $collection;

    /*
     * Get set up to query the information_schema database so we can 
     * determine the column types.
     */

    if (!$schema_db = new mysqli(HOSTNAME, USERNAME, PASSWORD, "information_schema")) {
        header("Status: 500 Server Error (Cannot connect to information schema)");
        exit();                          
    }
    $property = "";
    $data_type = "";
    $sql = "SELECT DATA_TYPE FROM COLUMNS WHERE TABLE_SCHEMA='".DATABASE."'"
           ." AND TABLE_NAME='$collection' AND COLUMN_NAME=";

    /*
     * We use prepared statements here for better performance, not
     * for protection against SQL injection (since we presumably
     * wouldn't attack ourselves). Since we're going to execute
     * the same query multiple times (once for each key in the
     * object), prepared statements make more sense.
     */

    if (!$schema_query = $schema_db->prepare($sql."?")) {
        header("Status: 500 Server Error (Cannot prepare information schema)");
        exit();                          
    }
    if (!$schema_query->bind_param("s", $property)) {
        header("Status: 500 Server Error (Cannot bind information schema parameters)");
        exit();                          
    }
    if (!$schema_query->bind_result($data_type)) {
        header("Status: 500 Server Error (Cannot bind information schema results)");
        exit();                          
    }
    
    /* Now we can go through and check for any required type coersions. */

    foreach ($object as $key => $value) {
        $property = $key;
        if (!$schema_query->execute()) {
            header("Status: 500 Server Error (Cannot execute schema query)");
            exit();
        }
        if (!$schema_query->fetch()) {
            header("Status: 500 Server Error (Cannot fetch schema query results)");
            exit();
        }
        switch($data_type) {
            case "bit":
                /*
                 * Note that we assume any column defined as
                 * bit type is a boolean; we don't consider the
                 * size of the bit field. If you're actually
                 * using honest-to-goodness bit fields, you'll
                 * need to modify this part.
                 */
                $object->$key = ($value == 1);
                break;
            case "int":
            case "tinyint":
            case "smallint":
            case "mediumint":
            case "bigint":
                $object->$key = intval($value);
                break;
            case "float":
            case "double":
            case "decimal":
                $object->$key = floatval($value);
                break;
        }
    }
    
    /* Clean up all the database objects we created. */
    $schema_query->close();
    $schema_db->close();

    /* All done; return the transformed object. */
    return($object);
}

/*
 * Convenience function to extract columns and
 * values from an object. This function is necessary
 * to make sure that object types (e.g. booleans)
 * have values appropriate for the database (e.g. 0 or 1).
 */

function get_sql_params($object) {
  
    global $collection_db;

    /*
     * Now let's scan through the object to pick out
     * the columns and values to insert into the database.
     * Since we're not tied to a specific database schema
     * in this script, we can't use prepared statements,
     * but we will escape the request data to protect
     * against SQL injection.
     */
     
    $columns  = array();
    $values   = array();
    $combined = array();
    foreach ($object as $key => $value) {
    
        /*
         * While we're scanning through the properties,
         * take care of the type appropriately by adjusting
         * the value as necessary.
         */
    
        switch (gettype($value)) {
            /* so far, all we have to adjust is boolean */
            case 'boolean':
                $value = ($value ? 1 : 0);
                break;
        };
        
        /*
         * Squash those SQL injection attacks.
         */
        
        $key   = $collection_db->real_escape_string($key);
        $value = $collection_db->real_escape_string($value);
        
        /*
         * Add backticks in case the column names are
         * MySQL reserved keywords.
         */
        $key = "`$key`";
        
        /*
         * And if the value is a multi-word string, we'll
         * need to enclose it in quotes.
         */
        if (str_word_count($value) > 0) {
            $value = "'$value'";
        }
        
        array_push($columns,  $key);
        array_push($values,   $value);
        array_push($combined, "$key=$value");
    };
    
    /*
     * Turn the arrays we've collected into comma-separated lists
     * so we can put them into an SQL query.
     */
     
    $sql_params['columns']   = implode(",",$columns);
    $sql_params['values']    = implode(",",$values);
    $sql_params['combined']  = implode(",",$combined);
    
    return($sql_params);
  
}

/*
 * Enough general stuff, time to figure out what operation
 * is requested. We do that based on the HTTP method. To quote
 * the backbone.js documenation (not that this script is limited
 * to backbone.js):
 *
 *     create -> POST    /collection
 *     read   -> GET     /collection[/id]
 *     update -> PUT     /collection/id
 *     delete -> DELETE  /collection/id
 *
 * (We're actually a little more forgiving, in that the .htaccess
 * rewrite rules listed above also permit an optional trailing
 * backslash.)
 */

switch ($_SERVER['REQUEST_METHOD']) {

    /*------------------------------------------------------------*/
    /* GET : retrieve one or all of the objects in the collection */
    case "GET":
    
        /*
         * Are we getting a specific object or the entire collection?
         */

        if (array_key_exists('id',$_REQUEST)) {
            /* grab the requested object from the database */
            $object_id = $_REQUEST['id'];
            if ($row = get_row($object_id)) {
                $object = coerce_object_types($row);              
                header('Status: 200 OK');
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($object);
            } else {
                /* couldn't find the requested object, so 404 time */
                header('Status: 404 Not Found');
            }
          
        } else {
  
            /* We're getting all the objects. */
            if (!$collection_query = $collection_db->prepare(
                    "SELECT * FROM $collection"
               )) {
                header("Status: 500 Server Error (Cannot prepare collection query)");
                exit();                          
            }
            if (!$collection_query->execute()) {
                header("Status: 500 Server Error (Cannot execute collection query)");
                exit();                          
            }
            
            /*
             * Build the objects to return in an array. It starts
             * empty and gets a new element for each row in the results.
             * If there are no rows, the array will be empty and that's
             * what we return.
             */
             
            $objects = array();
            $result = $collection_query->get_result();            
            while($row = $result->fetch_object()) {
                $object = coerce_object_types($row);              
                array_push($objects, $object);
            }
            
            /* Return the array via JSON. */
            header('Status: 200 OK');
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($objects);
            
            /* Database cleanup */
            $collection_query->close();
        }

         break;


    /*------------------------------------------------------------*/
    /* PUT : update an object in the collection                   */
    case  "PUT":
    
        /*
         * First let's identify the object to update and make
         * sure it actually exists.
         */

        $object_id = $_REQUEST['id'];
        if (!get_row($object_id)) {
            header('Status: 404 Not Found');
            exit();
        }
        
        /* See what the new values should be. */
        $object = json_decode(file_get_contents('php://input'), TRUE);
    
        /* Pick out the parameters we need for a database update. */
        $params = get_sql_params($object);
        
        $sql = "UPDATE $collection SET ".$params['combined']
               ." WHERE id = ".$collection_db->real_escape_string($object_id);

        if ($collection_db->query($sql)) {
          
            /*
             * The operation was successful, so return the newly
             * updated object.
             */
            
            if ($row = get_row($object_id)) {
        
                $object = coerce_object_types($row);              
                header('Status: 200 OK');
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($object);
        
            } else {
        
                /* couldn't find the requested object, oops */
                header('Status: 500 Server Error (Cannot find updated object)');
        
            }
            
        } else {
          
            /* The insertion failed, so return an error. */
            header('Status: 500 Server Error (Cannot update object)');
            
        }

        break;
  
  
    /*------------------------------------------------------------*/
     /* POST : create a new object for the collection              */
     case "POST":
     
         /* What's the new object we're going to create? */
        $object = json_decode(file_get_contents('php://input'), TRUE);
        
        /* Pick out the parameters we need for a database update. */
        $params = get_sql_params($object);
        
        /* Create the query. */
        $sql = "INSERT INTO $collection (".$params['columns'].")"
               ." values (".$params['values'].")";

        if ($collection_db->query($sql)) {
          
            /*
             * The operation was successful, so return the newly
             * added/updated object. (We have to do that so the client
             * can learn the id of the object.) Conveniently, we can
             * get the last id value easily, so grab it and then
             * query the database to get the full row.
             */
            
            if ($row = get_row($collection_db->insert_id)) {

                $object = coerce_object_types($row);              
                header('Status: 200 OK');
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode($object);

            } else {

                /* couldn't find the requested object, oops */
                header('Status: 500 Server Error (Cannot find new object)');

            }
            
        } else {
          
            /* The insertion failed, so return an error. */
            header('Status: 500 Server Error (Cannot add new object)');
        }

         break;
       
       
    /*------------------------------------------------------------*/
     /* DELETE : delete a model from the collection                */
     case "DELETE":
     
         /* Let's see what object we're supposed to delete */
        $object_id = $_REQUEST['id'];
        
        /* Go ahead and delete it */
        $collection_query = $collection_db->prepare(
            "DELETE FROM $collection WHERE id = ?"
        );
        $collection_query->bind_param("s", $object_id);
        $collection_query->execute();
        
        /*
         * Now see if we were successful. If so, we return a
         * 204 status code (instead of the standard 200) since
         * we're not actually returning any content. If we
         * couldn't complete the delete, then the object isn't
         * available and the request warrants a 404 response.
         */

        if ($collection_query->affected_rows == 1) {
            header('Status: 204 No Content');          
        } else {
            header('Status: 404 Not Found');          
        }
        
        /* Clean up database */
        $collection_query->close();

         break;

}



/* clean up open connections */
$collection_db->close();
?>
