const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../modals/user');
const Store = require('../modals/store');

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
        done(null, user);
    }).catch(function (err) {
        if (err)
            return done(err);
    });
});

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'realwave'
}, (payload, done) => {
    try {
        // Find the user specified in token
        var splitTokenValue = payload.sub;
        splitTokenValue = splitTokenValue.split(",");
        User.findById(splitTokenValue[0], (err, user) => {
            // If user doesn't exists, handle it
            if (!user) {
                return done(null, false);
            }

            // Otherwise, return the user
            done(null, user);
        });
    } catch (error) {
        done(error, false);
    }
}));

//LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email',
}, (email, password, done) => {

    try {
        //find user with email
        User.findOne({ email }, (err, user) => {
          //if not handle it
          if (!user) {
            return done(null, {
              success: false,
              error:
                "That e-mail address or username doesn't have an associated user account. Are you sure you've registered?",
            });
          }
          //check password if correct
          user.isValidPassword(password).then((isMatch) => {
            if (!isMatch) {
              return done(null, {
                success: false,
                error: 'Invalid username or password.',
              });
            }

            //otherwise return user
            done(null, {
              success: true,
              data: user,
            });
          });
        }).populate([
          {
            path: 'roleId',
            // populate: { path: 'permissions', select: { _id: 1, name: 1 } },
            populate: [
              'permissions.widgetId',
              'permissions.pageId',
              'permissions.reportId',
              'permissions.functionId',
            ],
            // select: { _id: 1, name: 1 },
          },
          { path: 'storeId', select: { _id: 1, name: 1 } },
          {
            path: 'clientId',
            select: { _id: 1, name: 1, theme: 1, logo: 1, clientType: 1 },
          },
        ]);
    } catch (error) {
        done(error, {
            success: false,
            error: error
        });
    }
}))
