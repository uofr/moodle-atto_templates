YUI.add('moodle-atto_templates-button', function (Y, NAME) {

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
 * Atto Templates - YUI file
 * @package   atto_templates
 * @author    Mark Sharp <m.sharp@chi.ac.uk>
 * @copyright 2017 University of Chichester {@link www.chi.ac.uk}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

 var COMPONENTNAME = 'atto_templates',
    CSS = {
        TEMPLATENAME: 'atto_templates_name',
        PREVIEW: 'atto_templates_preview',
        INSERT: 'atto_templates_insert',
        CANCEL: 'atto_templates_cancel',
        DESCRIPTION: 'atto_templates_description',
        LIST: 'templatelist',
        TYPE: 'templatetype'
    },
    SELECTORS = {
        TEMPLATES: '.' + CSS.TEMPLATENAME,
        INSERT: '.' + CSS.INSERT,
        PREVIEW: '.' + CSS.PREVIEW,
        CANCEL: '.' + CSS.CANCEL,
        DESCRIPTION: '.' + CSS.DESCRIPTION
    },
    TEMPLATES = {
        FORM: '' +
            '<form class="atto_form">' +
                '<div class="form-group">' +
                '<label for="{{elementid}}_{{CSS.TYPE}}">{{{get_string "selectacategory" component}}}</label>' +
                    '<select class="{{CSS.TYPE}} form-control" ' +
                        'id="{{CSS.TYPE}}" ' +
                        'name="{{elementid}}_{{CSS.TYPE}}">' +
                        '<option value="">{{get_string "selectacategory" component}}</option>' +
                        '{{#each categories}}' +
                            '<option value="{{key}}">{{name}}</option>' +
                        '{{/each}}' +
                    '</select>' +
                    '<label for="{{elementid}}_{{CSS.TEMPLATENAME}}">{{{get_string "selectatemplate" component}}}</label>' +
                    '<select class="{{CSS.TEMPLATENAME}} form-control" ' +
                        'id="{{CSS.LIST}}" ' +
                        'name="{{elementid}}_{{CSS.TEMPLATENAME}}">' +
                        '<option value="">{{get_string "selectatemplate" component}}</option>' +
                    '</select>' +
                '</div>' +
                '<div class="card-block {{CSS.DESCRIPTION}}" id="{{elementid}}_{{CSS.DESCRIPTION}}">' +
                '<label for="{{elementid}}_{{CSS.PREVIEW}}" class="d-block">{{get_string "preview" component}}</label>' +
                '<label id="{{CSS.DESCRIPTION}}" class="d-block"> {{description}}</label>' +
                '<div class="card">' +
                    '<div class="card-block {{CSS.PREVIEW}}" id="{{elementid}}_{{CSS.PREVIEW}}">' +
                    '</div>' +
                '</div>' +
                '<div class="mdl-align">' +
                    '<button class="btn btn-primary {{CSS.INSERT}}">{{get_string "insert" component}}</button> ' +
                    '<button class="btn btn-secondary {{CSS.CANCEL}}">{{get_string "cancel" component}}</button>' +
                '</div>' +
            '</form>'
    };

Y.namespace('M.atto_templates').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    _content: null,
    _templates: [],
    _categories: [],
    initializer: function() {
        this.addButton({
            icon: 'icon',
            iconComponent: COMPONENTNAME,
            callback: this._displayDialogue
        });
        this._templates = this.get('templates');
        this._categories = this.get('categories');
    },
    _displayDialogue: function() {
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('pluginname', COMPONENTNAME),
            focusAfterHide: true,
            width: 600
        });

        var content = this._getDialogueContent();
        dialogue.set('bodyContent', content);
        dialogue.show();
    },
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATES.FORM);
        this._templates = this.get('templates');
        this._categories = this.get('categories');
        this._content = Y.Node.create(template({
            elementid: this.get('host').get('elementid'),
            component: COMPONENTNAME,
            templates: this._templates,
            categories: this._categories,
            CSS: CSS
        }));
        this._content.one(SELECTORS.TEMPLATES).on('change', this._previewTemplate, this);
        this._content.get(CSS.LIST).on('change', this._getDescription, this);
        this._content.get(CSS.TYPE).on('change', this._changeCategory, this);
        this._content.one(SELECTORS.INSERT).on('click', this._insertTemplate, this);
        this._content.one(SELECTORS.CANCEL).on('click', this._cancel, this);
        return this._content;
    },
    _previewTemplate: function(e) {
        var value,
            previewWindow;

        value = document.getElementById("templatelist").value;

        // Find the template.
        var template = this._templateFilter(value);
        //if src exists, get file contents and overwrite template to use tinyMCE pulled one
        if(template['src']){
         var xmlhttp = new XMLHttpRequest();
         xmlhttp.onreadystatechange = function(){
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
           template = xmlhttp.responseText;
          }
         };
           xmlhttp.overrideMimeType && xmlhttp.overrideMimeType('text/plain');
           xmlhttp.open("GET",template['src'],false);
           xmlhttp.send(null);
        }
        previewWindow = Y.one(SELECTORS.PREVIEW);
        previewWindow.setHTML(template);
    },
    _getDescription: function() {
        //this only works for the tinyMCE pulled templates as they have a description
        var value,
            label;

     value = document.getElementById("templatelist").value;
     // Find the template.
     var template = this._templateFilter(value);
     label = document.getElementById(CSS.DESCRIPTION);
     label.innerHTML = "Description: " + template['description'];
    },
    _insertTemplate: function(e) {
        var input,
            value,
            host,
            template;
        host = this.get('host');
        e.preventDefault();

        this.getDialogue({
            focusAfterHide: null
        }).hide();

 

        input = Y.one(SELECTORS.TEMPLATES); // Find the template dropdown.
        value = input.get('value');
        template = this._templateFilter(value);
        if(template['src'] != "undefined") {
            var previewWindow = Y.one(SELECTORS.PREVIEW);
            template.template = previewWindow.getHTML();
        }
        // Y.log(template);
        // Y.log(input);
        host.enableCssStyling();
        host.insertContentAtFocusPoint(template.template);
        host.disableCssStyling();
        this.markUpdated();

    },
    _cancel: function(e) {
        e.preventDefault();
        this.getDialogue().hide();
    },
    _templateFilter: function(value) {
        len = Object.keys(this._templates).length;
        for (var x = 0; x < len; x++) {
            if (this._templates[x].templatekey == value) {
                 return this._templates[x];
            }
        }
        return this._templates;
    },
    _changeCategory: function(e) {
        value = document.getElementById(CSS.TYPE).value;
        len = Object.keys(this._templates).length;
     
        previewWindow = Y.one(SELECTORS.PREVIEW);
        previewWindow.setHTML('');
        document.getElementById(CSS.DESCRIPTION).innerHTML = '';

        ddl = this._content.get(CSS.LIST);
        dkey = document.getElementById("templatelist").options[0];

        ddl.empty();
        ddl.append(dkey);

        for (var x = 0; x < len-1; x++) {
            if (this._templates[x].templatekey.startsWith(value)) {
               ddl.append("<option value='" + this._templates[x].templatekey + "'>" + this._templates[x].title + "</option>");
            }
        }
    }
},
 {
    ATTRS: {
        templates: {
            value: {}
        },
        categories: {
            value: {}
        }
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
