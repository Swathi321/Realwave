var Tag = require("./../modals/tag");
var Event = require("./../modals/Event");
var EventDetail = require("./../modals/EventDetail");
const restHandler = require("./restHandler")();
const util = require('../util/util');

module.exports = {

  getTagList: (req, res, next) => {
    switch (req.body.action) {
      case 'load':
        getTags(req, res);
        //restHandler.getResource(req, res);
        break;
      case 'save':
        createTag(req, res);
      default:
          break;
    }

  },
};

function getTags(req, res) {
  const query = {};
  query.$or = [];
  query.$or.push({ isGlobal: true }, { clientId: req.session.user.clientId });
  //query.$project = { "name": 1, "client": 1};

  Tag.find(query).then((tags, error) => {
    let response = { success: true, message: "", data: null };
    if (error) {
      response.message = error;
    } else {
      response.data = tags;
      response.recordCount = tags.length;
    }
    res.status(200).json(response);
  });
}


async function createTag(req, res) {
  const tagBody = JSON.parse(req.body.data);
  const newTag = new Tag({
    name: tagBody.tagName,
    clientId: req.session.user.clientId,
    isGlobal: req.session.user.clientId ? false : true
  });

  try {
    const tag = await newTag.save();
    res.send(tag)
  } catch (error) {
    logger.error(error)
  }
}
