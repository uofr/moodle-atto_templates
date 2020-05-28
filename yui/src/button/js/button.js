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
     * @package   atto_template
     * @author    Mark Sharp <m.sharp@chi.ac.uk>
     * @copyright 2017 University of Chichester {@link www.chi.ac.uk}
     * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
     */
    
     var COMPONENTNAME = 'atto_template',
        CSS = {
            TEMPLATENAME: 'atto_template_name',
            PREVIEW: 'atto_template_preview',
            INSERT: 'atto_template_insert',
            CANCEL: 'atto_template_cancel',
            DESCRIPTION: 'atto_template_description',
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
                        '<ul class="nav nav-tabs" id="cpath" name ="cpath" role="tablist"></ul>' +
                    '</div>' +
                    '<div class="card-block {{CSS.DESCRIPTION}}" id="{{elementid}}_{{CSS.DESCRIPTION}}">' +
                        '<div class="tab-content" id="tpath">' +
                            '<div class="tab-pane fade" id="preview">' +
                                '<label id="{{CSS.DESCRIPTION}}" class="d-block"> {{description}}</label>' +
                                '<div class="card">' +
                                    '<div class="card-block {{CSS.PREVIEW}}" id="{{elementid}}_{{CSS.PREVIEW}}">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +    
                        '</div>' +
                        '<div class="mdl-align">' +
                            '<button class="btn btn-primary {{CSS.INSERT}}">{{get_string "insert" component}}</button> ' +
                            '<button class="btn btn-secondary {{CSS.CANCEL}}">{{get_string "cancel" component}}</button>' +
                        '</div>' +
                    '</div>' +
                '</form>'
        };
    
    Y.namespace('M.atto_template').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
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
            this._displayCategory();
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
            
            this._content.one(SELECTORS.INSERT).on('click', this._insertTemplate, this);
            this._content.one(SELECTORS.CANCEL).on('click', this._cancel, this);
            return this._content;
        },
        _previewTemplate: function(path, title) {
            var value,
                previewWindow;
    
            //value = document.getElementById("templatelist").value;
    
            // Find the template.
            //var template = this._templateFilter(title);
            //if src exists, get file contents and overwrite template to use tinyMCE pulled one
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function(){
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
               template = xmlhttp.responseText;
              }
             };
            xmlhttp.overrideMimeType && xmlhttp.overrideMimeType('text/plain');
            xmlhttp.open("GET",path,false);
            xmlhttp.send(null);
    
            previewWindow = Y.one(SELECTORS.PREVIEW);
            previewWindow.setHTML(template);
            this._getDescription(title);
            document.getElementById("preview-tab").click();
    
        },
        _getDescription: function(value) {
            //this only works for the tinyMCE pulled templates as they have a description
            var label;

         //value = document.getElementById("templatelist").value;
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
    
    
            var previewWindow = Y.one(SELECTORS.PREVIEW);
            template = previewWindow.getHTML();
    
            host.focus();
            host.insertContentAtFocusPoint(template);
           // host.disableCssStyling();
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
        _displayCategory: function() {
            len = this._categories.length;
            //csel = document.getElementById('cpath');
            csel = Y.one('#cpath');
            //psel = document.getElementById('tpath');
            psel = Y.one('#tpath');

    
            for (x=0; x<len; x++) {
                tab = this._tabCreate(this._categories[x].name, this._categories[x].key);
                csel.appendChild(tab);
    
                pane = this._tabPaneCreate(this._categories[x].key);
                psel.appendChild(pane);
            }
            tab = this._tabCreate('Preview', 'preview');
            csel.appendChild(tab);
    
            this._setListeners();
            
        },
        _tabCreate: function(category, key) {
            var tab, tabnav;
            tab = document.createElement('li');
            tab.setAttribute('class', 'nav-item template-nav');
    
            tabnav = document.createElement('a');
            tabnav.textContent = category;
            tabnav.setAttribute('id', key + '-tab');
            tabnav.setAttribute('class', 'nav-link');
            tabnav.setAttribute('data-toggle', 'tab');
            tabnav.setAttribute('href', '#' + key);
    
            tab.appendChild(tabnav);
    
            return tab;
        },
        _tabPaneCreate : function(id) {
            var pane = document.createElement('div');
            pane.setAttribute('id', id);
            pane.setAttribute('class', 'tab-pane fade');
    
            return pane;
        },
        _setListeners : function(){
            var tabs = document.getElementsByClassName("template-nav");
    
            for(var i=0; i<tabs.length; i++){
                Y.one(tabs[i]).on('click', function(tab){
                    this._changeList(tab._currentTarget.firstChild.getAttribute('id'));
                }, this);
            }
        },
        _changeList : function(tab) {
            //we don't want to change the preview tab
            if(tab == 'preview-tab'){
                return;
            }
    
            var tsrc, sel, len, key, list, listitem, licon, lname, regKey;
            tsrc = this._templates;
            len = Object.keys(this._templates).length;
            // the id is key-tab so cutting off the -tab gives us the key 
            key = tab.substring(0, tab.length - 4);
            regKey = new RegExp;
            sel = document.getElementById(key);
            //don't want to keep inserting nodes
            if(sel.hasChildNodes()){
                return;
            }
        
            list = document.createElement('ul');

            //template keys are made with the category key and the count number appended onto it in the sort function so you only need the name here
            for (x=0; x<len; x++) {
                if(tsrc[x]){
                    if(tsrc[x].templatekey.startsWith(key)){
                        //sel.options[sel.options.length] = new Option(tsrc[x].title, tinyMCEPopup.editor.documentBaseURI.toAbsolute(tsrc[x].src));
                        listitem = document.createElement('li');
                        lclass = tsrc[x].title.slice(tsrc[x].title.search(" "));
                        listitem.setAttribute('class', key + '-item' + lclass);
                        listitem.setAttribute('data-path', tsrc[x].src);
                        listitem.setAttribute('id',tsrc[x].templatekey );
                        
                        if(tsrc[x].icon) {
                            licon = this._insertIcon(tsrc[x].icon);
                            listitem.appendChild(licon);
                        }
                        else {
                            licon = this._insertFontawesomeIcon(key + '-item' + lclass);
                            listitem.appendChild(licon);
                        }
    
                        lname = document.createElement('p');
                        lname.textContent = tsrc[x].title;
                        listitem.appendChild(lname);
    
                        list.appendChild(listitem);
                    }
                }
            }
            sel.appendChild(list);
            this._setListListen(key + '-item');
        },
        _setListListen : function(className) {
            var items = document.getElementsByClassName(className);
    
            for(var i=0; i<items.length; i++){
                Y.one(items[i]).on('click', function(item){
                    this._previewTemplate(item._currentTarget.getAttribute('data-path'), item._currentTarget.getAttribute('id'));
                }, this);
            }
        },
        _insertIcon : function(path) {
            icon = document.createElement('img');
            icon.setAttribute('class','icon');
            icon.setAttribute('src', path);
    
            return icon;
        },
        _insertFontawesomeIcon : function(key) {
            icon = document.createElement('i');
            if (key.startsWith("alert")) {
                icon.setAttribute('class','fa fa-exclamation-circle');
            }
            else if (key.startsWith("button")) {
                icon.setAttribute('class','fa fa-caret-square-o-down');
            }
            else if (key.startsWith("callout")) {
                icon.setAttribute('class','fa fa-square-o');
            }
            else if (key.startsWith("pull")){
                icon.setAttribute('class','fa fa-quote-right');
            }
            else if (key.startsWith("card")){
                if(key == "card-item Block"){
                    icon.setAttribute('class','fa fa-address-card-o');
                }
                else {
                    icon.setAttribute('class','fa fa-id-card-o');
                }
            }
            return icon;
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