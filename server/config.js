Accounts.validateLoginAttempt(function (attempt) {
    if (!_.isEqual(attempt.user.profile.status, "active")) {
        attempt.allowed = false;
        throw new Meteor.Error(403, "Аккаунт заблокирован.");
    }
    return true;
});