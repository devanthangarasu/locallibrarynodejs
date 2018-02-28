var User = require('../models/user')
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display detail page for a specific Author.
exports.user_detail = function (req, res, next) {
  console.log('P1');

    async.parallel({
        user: function (callback) {
          console.log('P2');
            User.findById(req.user)
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.user == null) { // No results.
            var err = new Error('User not found');
            console.log('P3');
            err.status = 404;
            return next(err);
        }
        console.log(results.user);
        // Successful, so render.
        res.render('user_detail', { title: 'User Detail', user: results.user });
    });
};

// Display User update form on GET.
exports.user_get = function (req, res, next) {

    User.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        if (user == null) { // No results.
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user_form', { title: 'Update User', user: user });

    });
};

// Handle User update on POST.
exports.user_post = [

    // Validate fields.
    body('name').isLength({ min: 1 }).trim().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('username').isLength({ min: 1 }).trim().withMessage('User name must be specified.')
        .isAlphanumeric().withMessage('User name has non-alphanumeric characters.'),
    body('email', 'Invalid emaiid').isEmail(),


    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create User object with escaped and trimmed data (and the old id!)
        var user = new User(
            {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                _id: req.params.id
              }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('user_form', { title: 'Update User', user: user, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function (err, theuser) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theuser.url);
            });
        }
    }
];
