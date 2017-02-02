/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, app, window */

define(function (require, exports, module) {
    "use strict";


    var ExtensionUtils = app.getModule("utils/ExtensionUtils"),
        Commands       = app.getModule("command/Commands"),
        CommandManager = app.getModule("command/CommandManager"),
        MenuManager    = app.getModule("menu/MenuManager"),
        ProjectManager = app.getModule('engine/ProjectManager'),
        FileSystem     = app.getModule("filesystem/FileSystem"),
        NodeDomain     = app.getModule("utils/NodeDomain");


    function projectDump() {
        var project = getProject();
        console.log('Project', project);
        dtoDomain.exec("dump", project)
            .done(function (result) {
                console.log('Return the result ' + result);
            }).fail(function (err) {
            console.error("Failed to run dto.dump because", err);
        });
    }

    function getProject() {
        console.log('Getting Project');
        var project = ProjectManager.getProject();
        removeParents(project.ownedElements);
        delete project['_parent'];
        delete project['ownedViews'];
        delete project['selectedViews'];
        delete project['importedElementss'];
        project.modelType = project.constructor.name;
        console.log('Project', project);
        return project;
    }

    function removeParents(owned) {
        for (var e = 0; e < owned.length; e++) {
            var element       = owned[e];
            element.modelType = element.constructor.name;
            // console.log('Processing element ', element, ' with constructor ' + element.constructor);
            if (element._parent) {
                element.parentId = element._parent._id;
                delete element['_parent'];
            }
            delete element['ownedViews'];
            delete element['selectedViews'];
            delete element['importedElements'];

            if (element.end1) {
                dereferenceEnds(element.end1);
                dereferenceEnds(element.end2);
            }
            if (element.type) {
                if (element.type._id !== undefined) {
                    element.typeId = element.type._id;
                    delete element.type;
                }
            }

            var listprops = ['ownedElements', 'attributes', 'literals', 'operations', 'parameters'];
            for (var p = 0; p < listprops.length; p++) {
                var property = listprops[p];
                if (element[property] === undefined) {
                    continue;
                }
                // console.log('Checking for list elements in ' + listprops[p], element[property]);
                removeParents(element[property]);
            }
        }
    }

    function dereferenceEnds(end) {
        if (end._parent) {
            end.parentId = end._parent._id;
            delete end['_parent'];
        }
        if (end.reference) {
            end.referenceId = end.reference._id;
            delete end['reference'];
        }

    }

    // NodeDomain.connection.on("dto:log", function (evt, level, timestamp, message) {
    //     console.log("[dto node] %s %s %s", level, timestamp, message);
    // });
    var dtoDomain           = new NodeDomain("dto", ExtensionUtils.getModulePath(module, "node/DtoDomain"));
    var CMD_DTO_TOPLEVEL    = "tools.dto_top";
    var CMD_DTO_DUMP        = "tools.dto_dump";
    CommandManager.register("DTO", CMD_DTO_TOPLEVEL, CommandManager.doNothing);
    CommandManager.register("Dump", CMD_DTO_DUMP, projectDump);

    var menu    = MenuManager.getMenu(Commands.TOOLS);
    var dtoMenu = menu.addMenuItem(CMD_DTO_TOPLEVEL);
    dtoMenu.addMenuItem(CMD_DTO_DUMP);

});