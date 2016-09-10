var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve course
exports.getCourse = function (req, res, next, course) {
    models.Course.findById(course, function (err, course) {
        if (err) {
            return next(err);
        }
        if (!course) {
            return next(new Error('No course is found.'));
        }
        console.log('got course');
        req.course = course;
        next();
    });
};

// Retrieve many courses
exports.getCourseListForAdmin = function (req, res) {
    if (req.user.hasRole('admin')) {
        models.Course.findCourses().exec(function (err, courses) { 
            res.render('admin/courses', { courses: courses });
        });
    } else {
        models.Course.find({
            $or: [
                { 'instructors': { $in: [req.user.id] } }, 
                { 'teachingAssistants': { $in: [req.user.id] } }
            ], 
            $sort: { 
                code: 1 
            } 
        }, function (err, courses) { 
            res.render('admin/courses', { courses: courses });
        });
    }
};

exports.getCourseListForStudent = function (req, res) {
    models.Course.findCoursesByStudent(req.user.id).exec(function (err, courses) { 
        res.render('student/courses', { courses: courses });
    });
};

//
exports.getCourseForm = function (req, res) {
    async.series([
        function (done) {
            models.User.findInstructors().exec(done);        
        },
        function (done) {
            models.User.findTeachingAssistants().exec(done);        
        }
    ], function (err, results) {
        res.render('admin/course', { 
            course: req.course || new models.Course(), 
            instructors: results[0],
            teachingAssistants: results[1] 
        });
    });
};

// Add course model
exports.addCourse = function (req, res) {
    models.Course.create(req.body, function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to save course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses');
    });
};

// Update course
exports.editCourse = function (req, res) {
    _.extend(req.course, req.body).save(function (err) {  
        /*if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }*/
        res.redirect('/admin/courses/' + req.course.id + '/edit');
    });
};

// Delete course
exports.deleteCourse = function (req, res) {}; 