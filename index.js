// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');
var spritegenerator = require('node-spritegenerator');
var PluginError = gutil.PluginError;
var File = gutil.File;



// Consts
const PLUGIN_NAME = 'gulp-spritegenerator';

var opts = {};

function bufferContents (file, enc, cb) {
    cb(); //We don't care about the file inside the stream MOUAHAHAHAH btu it can be change in the future #teasing
}

function endStream (cb) {
    var self = this;
    spritegenerator.once('sprite:optimizing', function (e) {
        gutil.log('gulp-spritegenerator:', gutil.colors.yellow('Compression - original: ' + e.original + ' - compressed: ' + e.optimized));
    });
    spritegenerator.generate(opts, function (filespath) {
        for(var i in filespath) {
            var filepath = filespath[i];
            var file_content = null;
            try {
                file_content = fs.readFileSync(filepath);
            } catch (e) {
                gutil.log('gulp-spritegenerator:', gutil.colors.red('Error to get file content'));
                return;
            }
            var file = new File({
              path: path.join(filepath),
              contents: new Buffer(file_content)
            });
            self.push(file);
        }
        gutil.log('gulp-spritegenerator:', gutil.colors.green('Success'));
        cb();
    });
}



module.exports = function (opt) {
    if (!opt) {
      throw new PluginError(PLUGIN_NAME, 'Missing options for sprite generation!');
    }
    opts = opt;

    return through.obj(bufferContents, endStream);
};
