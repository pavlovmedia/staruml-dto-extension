/**
 * Created by mbletzin on 1/12/17.
 */
var _         = require('lodash'),
    fs        = require('fs');


(function () {

    function dumpProject(project) {
        var dumpFile = __dirname + '/../project.json';
        console.log('Writing to ' + dumpFile);
        fs.writeFileSync(dumpFile, JSON.stringify(project), {encoding: 'utf8'});
        return "Finished";
    }

    /**
     * Initializes the test domain with several test commands.
     * @param {DomainManager} domainManager The DomainManager for the server
     */
    function init(domainManager) {
        if (!domainManager.hasDomain("dyo")) {
            domainManager.registerDomain("dto", {major: 0, minor: 1});
        }
        domainManager.registerCommand(
            "dto",       // domain name
            "dump",    // command name
            dumpProject,   // command handler function
            false,          // this command is synchronous in Node
            "Returns the total or free memory on the user's system in bytes",
            [{
                name: "project", // parameters
                type: "object",
                description: "Project model from StarUML"
            }],
            [{
                name: "result", // return values
                type: "string",
                description: "report"
            }]
        );
    }

    exports.init = init;

})();