const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kicUserSchema = new Schema({
    associatedId: { type: Number },
    kicAssociateId: { type: String },
    kicAssociatedName: { type: String },
}, { timestamps: true });

const Kicuser = mongoose.model('kicUser', kicUserSchema, 'kicUser');
function insertDefaultKICUser() {
    Kicuser.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            Kicuser.create({
                associatedId: 123,
                kicAssociateId: "af605310-ef8a-4b74-979f-529ea1eae6c8",
                kicAssociatedName: "Mike"


            });

        }
    });
}

module.exports = Kicuser;