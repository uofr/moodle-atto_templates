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
 * atto_template settings
 * @package   atto_template
 * @author    Mark Sharp <m.sharp@chi.ac.uk>
 * @copyright 2017 University of Chichester {@link www.chi.ac.uk}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;
if (!defined('atto_template_TEMPLATE_COUNT')) {
    define('atto_template_TEMPLATE_COUNT', 3);
}


if (is_siteadmin()) {
    $config = get_config('atto_template');
    $ADMIN->add('editoratto', new admin_category('atto_template', new lang_string('pluginname', 'atto_template')));

    $settings = new admin_settingpage('atto_template_settings', new lang_string('settings', 'atto_template'));
    $settings->add(new admin_setting_configcheckbox('atto_template/templatesource',
        get_string('templatesource', 'atto_template'), 
        get_string('templatesource_desc', 'atto_template'),
        0));
    
	if (!isset($config->templatesource)) {
		$config->templatesource = 0;
	}
	  
    if ($config && $config->templatesource == 0) {  
    $settings->add(new admin_setting_configtext('atto_template/templatecount',
        get_string('templatecount', 'atto_template'),
        get_string('templatecount_desc', 'atto_template'),
        atto_template_TEMPLATE_COUNT, PARAM_INT, 20));
    }

    if ($config && property_exists($config, 'templatecount') && $config->templatesource == 1) {
        $templatecount = 0;
    }
    elseif ($config && property_exists($config, 'templatecount')) {
        $templatecount = $config->templatecount;
    }
    else {
        $templatecount = atto_template_TEMPLATE_COUNT;
    }

    if ($templatecount > 0) {
      for ($i = 1; $i <= $templatecount; $i++) {
        if ($config && property_exists($config, 'templatekey_' . $i)) {
            $tname = $config->{'templatekey_' . $i};
            if (empty($tname)) {
                $tname = $i;
            }
        } else {
            $tname = $i;
        }

        $settings->add(new admin_setting_heading('atto_template/templatepageheading_' . $i,
                get_string('templateheading', 'atto_template', $tname), ''));

        // Template key.
        $settings->add(new admin_setting_configtext('atto_template/templatekey_' . $i ,
            get_string('templatekey', 'atto_template', $i),
            get_string('templatekey_desc', 'atto_template'),
            '', PARAM_ALPHANUMEXT));

        // Template body.
        $settings->add(new admin_setting_configtextarea('atto_template/template_' . $i,
            get_string('template', 'atto_template', $i),
            get_string('template_desc', 'atto_template'), ''));
        }
    } 
}
