<?php

sleep(1);

function json_fix_cyr($var)
{
   if (is_array($var)) {
       $new = array();
       foreach ($var as $k => $v) {
           $new[json_fix_cyr($k)] = json_fix_cyr($v);
       }
       $var = $new;
   } elseif (is_object($var)) {
       $vars = get_object_vars($var);
       foreach ($vars as $m => $v) {
           $var->$m = json_fix_cyr($v);
       }
   } elseif (is_string($var)) {
       $var = iconv('cp1251', 'utf-8', $var);
   }
   return $var;
}

  $isAJAXRequest = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

  if ( $isAJAXRequest ) {
      echo json_encode(
        array(
          'text'  => '<p>Thank you for your form submitting!</p>'
        )
      );
  } else {

      echo "<pre style='color: red'>GET:</pre>";
      var_dump($_GET);

      echo "<pre style='color: red'>POST:</pre>";
      var_dump($_POST);

       echo "<pre style='color: red'>FILES:</pre>";
      var_dump($_FILES);

  }
?>
