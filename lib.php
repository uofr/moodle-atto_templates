<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Templates Lib.
 * @package   atto_templates
 * @author    Mark Sharp <m.sharp@chi.ac.uk>
 * @copyright 2017 University of Chichester {@link www.chi.ac.uk}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

/**
 * Set language strings for js
 */
function atto_templates_strings_for_js() {
    global $PAGE;
    $PAGE->requires->strings_for_js(
        ['dialogtitle',
         'template',
         'selectatemplate',
         'description',
         'insert',
         'cancel',
         'preview',
         'selectacategory',
     ], 'atto_templates');
}

/**
 * Return the js params required for this module
 * @param string elementid Selected element
 * @param stdClass $options - the options for the editor
 * @param stdClass $fpoptions - unused
 * @return array List of templates
 */
function atto_templates_params_for_js($elementid, $options, $fpoptions) {
    global $CFG;
    $templates = get_config('atto_templates');
    $tsource = $templates->templatesource;

    if ($tsource == 0) {
    $tcount = ($templates->templatecount) ? $templates->templatecount : ATTO_TEMPLATES_TEMPLATE_COUNT;
    $items = [];
    for ($i = 1; $i <= $tcount; $i++) {
        $key = 'templatekey_' . $i;
        if (isset($templates->{$key}) && !empty(trim($templates->{$key}))) {
            $item = new stdClass();
            $item->templatekey = trim($templates->{'templatekey_' . $i});
            $item->template = clean_text(
                    $templates->{'template_' . $i}, FORMAT_HTML);
            $items[] = $item;
        }
    }
   }
   else {
       /*getting the config for tinyMCE since the templates are stored there
       MCE template example
       array[0] {
          [title]=>"title string"
          [SRC]=>"template file path string"
          [description]=>"template description string"
        }
        */
    $tconfig = get_config('editor_tinymce');
    $tcount = 0;
    //using TinyMCE code to grab their array just like they do
    if (!empty($tconfig->customconfig)) {
        $tconfig->customconfig = trim($tconfig->customconfig);
        $decoded = json_decode($tconfig->customconfig, true);
        if (is_array($decoded)) {
            foreach ($decoded as $k=>$v) {
                $params[$k] = $v;
            }
            
        //first array grabbed is a 3-dimensional array, only need templates_templates so reducing to 2 dimensional next    
         $values = atto_template_sort($params);
         // $items is to keep inline with old code that plugin first used so other method isn't broken
        }
    }
    //sending over the template count since this plugin uses it
    //this method stored 61 templates when first used
    $values['items']["source"] = "tinymce";
   }
    return array('templates' => $values['items'], 'categories' => $values['categories']);
}

/**
 * Get icon mapping for font-awesome.
 */
function atto_templates_get_fontawesome_icon_map() {
    return [
        'atto_templates:icon' => 'fa-wpforms',
        'atto_templates:test' => 'fa-dragon'
    ];
}


//sorting 3 dimensional array into multiple 3 dimensional arrays based on type
function atto_template_sort(& $params) {
    global $CFG;
    $count = 0;
    $categories = [];
    $types = [];
    
    foreach ($params['template_templates'] as $j=>$w) {
        
        $items[$j] = $w;
        //search the name string for identifying type
        $str = $items[$j]["title"];
        $catkey = strtolower(substr($str, 0, strpos($str, ' ')));
        $items[$j]["templatekey"] = $catkey . $count;
        $count++;



       if (!isset($types[$catkey])){
        $types[$catkey] = array();
        $types[$catkey]['name'] = ucfirst($catkey);
        if ($types[$catkey]['name'] == 'Pull') {
            $types[$catkey]['name'] = $types[$catkey]['name'] . " Quotes";
        }
        else if ($types[$catkey]['name'] == 'Drop') {
            $types[$catkey]['name'] = $types[$catkey]['name'] . "downs";
        }
        else if ($types[$catkey]['name'] == 'Callout' || $types[$catkey]['name'] == 'Card') {
            $types[$catkey]['name'] = $types[$catkey]['name'] . "s";
        } else {
        	$types[$catkey]['name'] .= "s";
        }

        $types[$catkey]['key'] = $catkey;

        $categories[] = $types[$catkey];
       }



        //need to convert src into a viable filepath
        $items[$j]["src"] = $CFG->wwwroot . "/". $items[$j]["src"];
        if(isset($items[$j]["icon"])) {
            $items[$j]["icon"] = $CFG->wwwroot . "/". $items[$j]["icon"];
        }

    }

    usort($categories, "cmp");
	
	$alerts = array_shift($categories);
	$buttons = array_shift($categories);
	
	array_push($categories, $alerts, $buttons);
	
    $values = array();
    $values['items'] = $items;
    $values['categories'] = $categories;
 return $values;
}

function cmp($a, $b)
{
    return strcmp($a["name"], $b["name"]);
}