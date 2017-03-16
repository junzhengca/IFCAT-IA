var fs = require('fs-extra'),
    multer = require('multer'),
    path = require('path');

var config = require('./config');

exports.any = multer({ 
    storage: multer.diskStorage({
        destination: function mkdir(req, file, done) {
            var dir = path.resolve(config.uploadPath + '/' + req.params.course);
            // create course directory if it does not already exist
            fs.mkdirs(dir, function (err) {
                if (err)
                    return done(err);
                done(null, dir);
            });
        },
        filename: function uniqFilename(req, file, done) {
            var dir = path.resolve(config.uploadPath + '/' + req.params.course),
                extname = path.extname(file.originalname),
                basename = path.basename(file.originalname, extname),
                i = 1;
            fs.readdir(dir, function (err, filenames) {
                if (err)
                    return done(err);
                // generate filename until it is unique within the directory
                for (;;) {
                    var newname = [basename, i > 1 ? ' (' + i + ')' : '', extname].join('');
                    if (filenames.indexOf(newname) === -1)
                        return done(null, newname);
                    i++;
                }
            });
        }
    })
});

exports.csv = multer({ storage: multer.MemoryStorage });